import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage']);
const requiredFiles = [
  'AGENTS.md',
  'CODEX_START_HERE.md',
  'PLANS.md',
  'README.md',
  'package.json',
  'schemas/plan-update.schema.json',
  'src/main.tsx',
  'src/domain/planEngine.ts',
  'src/domain/planUpdates.ts',
  'src/infrastructure/driveSync.ts'
];

const errors = [];
for (const file of requiredFiles) {
  try {
    const info = await stat(resolve(root, file));
    if (!info.isFile()) errors.push(`${file} n'est pas un fichier.`);
  } catch {
    errors.push(`${file} est manquant.`);
  }
}

const files = await walk(root);
for (const file of files) {
  const rel = relative(root, file);
  const extension = extname(file).toLowerCase();
  if (extension === '.json') {
    try {
      JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      errors.push(`${rel}: JSON invalide (${message(error)}).`);
    }
  }
  if (extension === '.md') {
    const text = await readFile(file, 'utf8');
    for (const link of markdownLinks(text)) {
      if (isExternalOrAnchor(link)) continue;
      const clean = decodeURIComponent(link.split('#', 1)[0]?.split('?', 1)[0] ?? '');
      if (!clean) continue;
      const target = normalize(resolve(dirname(file), clean));
      if (!target.startsWith(root)) {
        errors.push(`${rel}: lien sortant du dépôt interdit (${link}).`);
        continue;
      }
      try {
        await stat(target);
      } catch {
        errors.push(`${rel}: lien relatif introuvable (${link}).`);
      }
    }
  }
  if (['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.yml', '.yaml', '.sh'].includes(extension)) {
    const text = await readFile(file, 'utf8');
    if (/^(<{7}|={7}|>{7})/m.test(text)) {
      errors.push(`${rel}: marqueur de conflit Git détecté.`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`ERREUR ${error}`);
  process.exitCode = 1;
} else {
  console.log(`OK dépôt: ${files.length} fichiers contrôlés, liens relatifs et JSON valides.`);
}

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

function markdownLinks(text) {
  const result = [];
  const pattern = /!?(?:\[[^\]]*\])\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of text.matchAll(pattern)) {
    if (match[1]) result.push(match[1].replace(/^<|>$/g, ''));
  }
  return result;
}

function isExternalOrAnchor(link) {
  return link.startsWith('#') || /^(?:https?:|mailto:|tel:|data:)/i.test(link);
}

function message(error) {
  return error instanceof Error ? error.message : String(error);
}
