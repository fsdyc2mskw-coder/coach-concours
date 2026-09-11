import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), 'schemas');
const files = (await readdir(root)).filter((name) => name.endsWith('.json'));
let failed = false;
for (const file of files) {
  try {
    const text = await readFile(resolve(root, file), 'utf8');
    const value = JSON.parse(text);
    if (!value.$schema || !value.title || !value.type) {
      throw new Error('champs $schema, title ou type manquants');
    }
    console.log(`OK ${file}`);
  } catch (error) {
    failed = true;
    console.error(`ERREUR ${file}:`, error instanceof Error ? error.message : error);
  }
}
if (failed) {
  process.exitCode = 1;
}
