// CHANGE_REQUEST_009 — block grammar and flow strip.
//
// Asserts the four-slot block grammar (faire mandatory, regle/noter/details
// optional) is applied to the Week 1 Thu/Fri/Sat blocks named in the change
// request's Inputs table, that no sentence from the old single-paragraph
// prescription was silently dropped, and that the day-header flow strip for
// Friday 11 Sep reads the minute sequence named in the change request.
import { describe, expect, it } from 'vitest';
import { flowStrip, recipes } from '../coach/recipes';
import type { ExerciseBlock } from '../coach/types';

function fullText(block: ExerciseBlock): string {
  return [block.faire, block.regle, block.noter, block.details].filter(Boolean).join(' ');
}

describe('CR-009 block grammar (Week 1 Thu/Fri/Sat)', () => {
  const days = [recipes.week1Thu10Sep!, recipes.week1Fri11Sep!, recipes.week1Sat12Sep!];

  it('every block has a non-empty faire slot', () => {
    for (const recipe of days) {
      for (const block of recipe.blocks) {
        expect(block.faire.length).toBeGreaterThan(0);
      }
    }
  });

  it('renders regle only when an official rule applies (Friday, station 2)', () => {
    const station2 = recipes.week1Fri11Sep!.blocks.find((block) => block.title.startsWith('Poste 2'))!;
    expect(station2.regle).toContain('Règle officielle (S1)');
    expect(station2.regle).toContain('5 passages aller, 4 retour');
    expect(station2.faire).toContain('2 tours complets à allure marchée');
  });

  it('keeps the Thursday "not recorded" sentence, moved to noter', () => {
    const racket = recipes.week1Thu10Sep!.blocks.find((block) => block.title.startsWith('Raquette'))!;
    expect(racket.noter).toContain('Aucun comptage de chutes n’a été enregistré');
    expect(racket.faire).toContain('Jeu d’équilibre facile');
  });

  it('keeps the Thursday EMOM substitution note, moved to details', () => {
    const emom = recipes.week1Thu10Sep!.blocks.find((block) => block.title.startsWith('Conditioning EMOM'))!;
    expect(emom.details).toContain('Remplace l’EMOM prévu');
    expect(emom.faire).toContain('10 burpees');
  });

  it('keeps the Friday memory-recall reminder, moved to details', () => {
    const memory = recipes.week1Fri11Sep!.blocks.find((block) => block.title.startsWith('Mémoire'))!;
    expect(memory.details).toContain('Ne jamais demander d’explication');
    expect(memory.faire).toContain('Réciter les 11 postes');
  });

  it('keeps the Friday AMRAP safety rule, moved to details', () => {
    const amrap = recipes.week1Fri11Sep!.blocks.find((block) => block.title.startsWith('AMRAP'))!;
    expect(amrap.details).toContain('Pas de bascule sur l’échelle');
    expect(amrap.faire).toContain('60 sauts à la corde');
  });

  it('every block keeps a full, non-empty rendering: faire plus any optional slots', () => {
    for (const recipe of days) {
      for (const block of recipe.blocks) {
        expect(fullText(block).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('CR-009 day header flow strip', () => {
  it('Friday 11 reads 5 → 4 → 8 → 5 → 10 → 5 → 2 minutes', () => {
    const nodes = flowStrip(recipes.week1Fri11Sep!);
    expect(nodes.map((node) => node.minutes)).toEqual([5, 4, 8, 5, 10, 5, 2]);
    expect(nodes.map((node) => node.label)).toEqual([
      'échauffement',
      'mémoire',
      'poste 2',
      'raquette',
      'AMRAP',
      'poste 8',
      'calme'
    ]);
  });
});
