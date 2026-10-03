// CHANGE_REQUEST_018 — the exact data of the memory game, GENERATED from
// handoffs/MOCKUP_CR018_assets.md (2 October 2026) and checked against it by
// src/__tests__/cr018.test.ts. Do not edit by hand: copy the values as they
// are, never redraw, rename or reorder anything (the assets file's own rule).

export type StationId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9' | 's10' | 's11';

export interface GameStation { id: StationId; number: number; label: string; pictogram: string; }

// Section 1 — the 11 stations, official order. Pictogram: one SVG path,
// viewBox 0 0 24 24, stroke only, width 1.9, round caps and joins, accent stroke.
export const GAME_STATIONS: readonly GameStation[] = [
  { id: "s1", number: 1, label: "Slalom", pictogram: "M4 21V5M12 21V5M20 21V5M1 13c2-4 4-4 5 0s4 4 6 0 4-4 6 0 3 4 5 0" },
  { id: "s2", number: 2, label: "Obstacle", pictogram: "M8 13h9v8H8zM3 19c0-10 16-11 18-4M2 7a2 2 0 1 0 4 0a2 2 0 1 0-4 0" },
  { id: "s3", number: 3, label: "Espaliers", pictogram: "M7 5v16M17 5v16M7 9h10M7 13h10M7 17h10M3 9c1-8 17-8 18 0" },
  { id: "s4", number: 4, label: "Mannequin", pictogram: "M2.8 15a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0M7.5 16h9M11 16l-2 4M14 16l2 4M13 8h8M18 5l3 3-3 3" },
  { id: "s5", number: 5, label: "Chariot", pictogram: "M3 8h12v8H3zM4.4 19a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0M10.4 19a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0M16 12h5M18.5 9.5l2.5 2.5-2.5 2.5" },
  { id: "s6", number: 6, label: "Écrous", pictogram: "M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9zM8.5 12a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0" },
  { id: "s7", number: 7, label: "Sac à la corde", pictogram: "M2 8c4 0 6 2 9 4M11 12l2-2h5l3 3v7H11z" },
  { id: "s8", number: 8, label: "Cerceaux", pictogram: "M2 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0M9 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0M16 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0M9.4 6.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0" },
  { id: "s9", number: 9, label: "Banc", pictogram: "M2 12h20M5 12v7M19 12v7M10 6.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0" },
  { id: "s10", number: 10, label: "Corde à sauter", pictogram: "M6 3v6M18 3v6M6 9c0 13 12 13 12 0" },
  { id: "s11", number: 11, label: "Raquette", pictogram: "M3.5 10a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0M13 14l7 7M7.8 3a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0" }
];

// Section 2 — box CENTRES as a fraction of the room (0,0 = top left), from
// rules/floor_plan.md v1. The room is drawn at aspect 640 : 944.
export const ROOM_ASPECT = { width: 640, height: 944 } as const;
export const FLOOR_PLAN: Readonly<Record<StationId, { nx: number; ny: number }>> = {
  s1: { nx: 0.3, ny: 0.793 },
  s2: { nx: 0.617, ny: 0.792 },
  s3: { nx: 0.908, ny: 0.676 },
  s4: { nx: 0.705, ny: 0.498 },
  s5: { nx: 0.938, ny: 0.275 },
  s6: { nx: 0.773, ny: 0.059 },
  s7: { nx: 0.395, ny: 0.057 },
  s8: { nx: 0.408, ny: 0.282 },
  s9: { nx: 0.122, ny: 0.065 },
  s10: { nx: 0.139, ny: 0.367 },
  s11: { nx: 0.131, ny: 0.629 }
};
export const DOOR_AND_ATHLETE = { nx: 0.07, ny: 0.962 } as const;

// Section 3 — tray order, both PLAN and ORDRE.
export const TRAY_ORDER: readonly StationId[] = ["s7", "s2", "s10", "s5", "s1", "s9", "s4", "s11", "s3", "s8", "s6"];

// Section 4 — QUI MANQUE, the 3 rounds: the missing station, the 4 choices
// in the order shown, the explanation shown after the answer.
export interface MissingRound { missing: StationId; choices: StationId[]; explanation: string; }
export const MISSING_ROUNDS: readonly MissingRound[] = [
  { missing: "s6", choices: ["s5", "s6", "s4", "s9"], explanation: "Écrous vient après le chariot. Les deux alternent : 5 → 6 → 5 → 6." },
  { missing: "s9", choices: ["s9", "s10", "s7", "s11"], explanation: "Le banc vient après les cerceaux et avant la corde à sauter." },
  { missing: "s3", choices: ["s2", "s3", "s1", "s4"], explanation: "Les espaliers viennent juste après l'obstacle." }
];

// Section 5 — RÈGLES, the 10 pictures in order: the station number and label
// shown, the right answer, the explanation, and the fixed SVG (310 × 220).
export interface RulesPicture { station: number; label: string; answer: 'correct' | 'faux'; explanation: string; svg: string; }
export const RULES_PICTURES: readonly RulesPicture[] = [
  {
    station: 1, label: "Slalom", answer: "faux",
    explanation: "Aller tout droit jusqu'au bout des piquets, retour en slalom.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path d=\"M250 95v40M190 95v40M130 95v40M70 95v40\" stroke=\"#F0655A\" stroke-width=\"6\"></path>\n<path d=\"M30 115Q60 70 100 115T160 115T220 115T285 115\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<path d=\"M273 105l12 10-12 10\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<text x=\"30\" y=\"72\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\">aller ▸</text>\n<path d=\"M285 185H30M42 175l-12 10 12 10\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<text x=\"285\" y=\"210\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\" text-anchor=\"end\">◂ retour</text>\n</svg>"
  },
  {
    station: 1, label: "Slalom", answer: "correct",
    explanation: "Aller tout droit, retour en slalom.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path d=\"M30 45H285M273 35l12 10-12 10\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<text x=\"30\" y=\"28\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\">aller ▸</text>\n<path d=\"M250 105v40M190 105v40M130 105v40M70 105v40\" stroke=\"#F0655A\" stroke-width=\"6\"></path>\n<path d=\"M285 125Q255 80 220 125T160 125T100 125T30 125\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<path d=\"M42 115l-12 10 12 10\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<text x=\"285\" y=\"195\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\" text-anchor=\"end\">◂ retour</text>\n</svg>"
  },
  {
    station: 8, label: "Cerceau BLEU", answer: "correct",
    explanation: "Bleu : pied droit, dribble à droite.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<ellipse cx=\"135\" cy=\"160\" rx=\"100\" ry=\"34\" stroke=\"#4A8CFF\" stroke-width=\"9\"></ellipse>\n<ellipse cx=\"150\" cy=\"150\" rx=\"13\" ry=\"24\" fill=\"#F2F3F5\"></ellipse>\n<text x=\"150\" y=\"112\" fill=\"#F2F3F5\" font-family=\"Plus Jakarta Sans\" font-weight=\"800\" font-size=\"18\" text-anchor=\"middle\">D</text>\n<circle cx=\"262\" cy=\"70\" r=\"20\" fill=\"#F5A04A\"></circle>\n<path d=\"M242 70h40M262 50v40\" stroke=\"#0A0B0E\" stroke-width=\"2\"></path>\n<path d=\"M262 100v40M254 132l8 8 8-8\" stroke=\"#F2F3F5\" stroke-width=\"3\"></path>\n<text x=\"60\" y=\"45\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\">◂ retour · dribble</text>\n</svg>"
  },
  {
    station: 8, label: "Cerceau JAUNE", answer: "faux",
    explanation: "Jaune : pieds joints, pas de dribble.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linecap=\"round\">\n<ellipse cx=\"155\" cy=\"150\" rx=\"110\" ry=\"38\" stroke=\"#F5C84A\" stroke-width=\"9\"></ellipse>\n<ellipse cx=\"135\" cy=\"140\" rx=\"13\" ry=\"24\" fill=\"#F2F3F5\"></ellipse>\n<text x=\"135\" y=\"100\" fill=\"#F2F3F5\" font-family=\"Plus Jakarta Sans\" font-weight=\"800\" font-size=\"18\" text-anchor=\"middle\">G</text>\n<path d=\"M175 95c10 8 10 22 0 30\" stroke=\"#F2F3F5\" stroke-width=\"3\" stroke-dasharray=\"3 6\"></path>\n<text x=\"196\" y=\"118\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\">un seul pied</text>\n</svg>"
  },
  {
    station: 8, label: "Cerceau ROUGE", answer: "faux",
    explanation: "Rouge : pied gauche, dribble à gauche.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<ellipse cx=\"135\" cy=\"160\" rx=\"100\" ry=\"34\" stroke=\"#F0655A\" stroke-width=\"9\"></ellipse>\n<ellipse cx=\"150\" cy=\"150\" rx=\"13\" ry=\"24\" fill=\"#F2F3F5\"></ellipse>\n<text x=\"150\" y=\"112\" fill=\"#F2F3F5\" font-family=\"Plus Jakarta Sans\" font-weight=\"800\" font-size=\"18\" text-anchor=\"middle\">D</text>\n<circle cx=\"262\" cy=\"70\" r=\"20\" fill=\"#F5A04A\"></circle>\n<path d=\"M242 70h40M262 50v40\" stroke=\"#0A0B0E\" stroke-width=\"2\"></path>\n<path d=\"M262 100v40M254 132l8 8 8-8\" stroke=\"#F2F3F5\" stroke-width=\"3\"></path>\n<text x=\"60\" y=\"45\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\">◂ retour · dribble</text>\n</svg>"
  },
  {
    station: 2, label: "Obstacle", answer: "correct",
    explanation: "5 passages à l'aller avec une balle, posée dans la boîte rouge. 4 au retour sans balle.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<rect x=\"125\" y=\"80\" width=\"60\" height=\"70\" rx=\"6\" fill=\"#1D2027\" stroke=\"#4A8CFF\" stroke-width=\"3\"></rect>\n<path d=\"M20 60H112M100 50l12 10-12 10\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<text x=\"20\" y=\"40\" fill=\"#F2F3F5\" font-family=\"Plus Jakarta Sans\" font-weight=\"800\" font-size=\"20\">aller</text>\n<circle cx=\"35\" cy=\"80\" r=\"11\" fill=\"#D9F25A\"></circle>\n<text x=\"55\" y=\"87\" fill=\"#F2F3F5\" font-family=\"Plus Jakarta Sans\" font-weight=\"800\" font-size=\"20\">× 5</text>\n<path d=\"M190 175H270M200 165l-10 10 10 10\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<text x=\"215\" y=\"160\" fill=\"#F2F3F5\" font-family=\"Plus Jakarta Sans\" font-weight=\"800\" font-size=\"20\">retour</text>\n<text x=\"215\" y=\"210\" fill=\"#F2F3F5\" font-family=\"Plus Jakarta Sans\" font-weight=\"800\" font-size=\"20\">× 4</text>\n<circle cx=\"268\" cy=\"203\" r=\"11\" stroke=\"#9AA0AC\" stroke-width=\"2\" stroke-dasharray=\"3 4\"></circle>\n<rect x=\"225\" y=\"40\" width=\"64\" height=\"40\" rx=\"6\" fill=\"#F0655A\"></rect>\n<circle cx=\"241\" cy=\"56\" r=\"7\" fill=\"#D9F25A\"></circle><circle cx=\"257\" cy=\"56\" r=\"7\" fill=\"#D9F25A\"></circle><circle cx=\"273\" cy=\"56\" r=\"7\" fill=\"#D9F25A\"></circle><circle cx=\"249\" cy=\"68\" r=\"7\" fill=\"#D9F25A\"></circle><circle cx=\"265\" cy=\"68\" r=\"7\" fill=\"#D9F25A\"></circle>\n</svg>"
  },
  {
    station: 2, label: "Obstacle", answer: "faux",
    explanation: "La balle reste dans la boîte rouge. Le retour se fait sans balle.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<rect x=\"120\" y=\"120\" width=\"70\" height=\"80\" rx=\"6\" fill=\"#1D2027\" stroke=\"#4A8CFF\" stroke-width=\"3\"></rect>\n<path d=\"M120 145h70M120 170h70\" stroke=\"#F2F3F5\" stroke-opacity=\".5\" stroke-width=\"3\"></path>\n<path d=\"M250 150C240 60 80 60 60 150\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<path d=\"M50 132l10 18 16-12\" stroke=\"#F2F3F5\" stroke-width=\"4\"></path>\n<circle cx=\"155\" cy=\"72\" r=\"14\" fill=\"#D9F25A\"></circle>\n<path d=\"M141 72c6 4 22 4 28 0\" stroke=\"#0A0B0E\" stroke-width=\"2\"></path>\n<text x=\"155\" y=\"30\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\" text-anchor=\"middle\">◂ retour</text>\n</svg>"
  },
  {
    station: 6, label: "Écrous", answer: "correct",
    explanation: "Une couleur : 1 gros et 2 petits, sur les 3 vis de cette couleur.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linejoin=\"round\">\n<rect x=\"40\" y=\"55\" width=\"240\" height=\"120\" rx=\"10\" fill=\"#C9A36A\" fill-opacity=\".22\" stroke=\"#C9A36A\" stroke-width=\"2\"></rect>\n<circle cx=\"62\" cy=\"115\" r=\"9\" fill=\"#F0655A\"></circle>\n<path d=\"M132 115L121 134.1H99L88 115L99 95.9H121Z\" fill=\"#F0655A\"></path><circle cx=\"110\" cy=\"115\" r=\"6\" fill=\"#15171C\"></circle>\n<path d=\"M184 115L177 127.1H163L156 115L163 102.9H177Z\" fill=\"#F0655A\"></path><circle cx=\"170\" cy=\"115\" r=\"4\" fill=\"#15171C\"></circle>\n<path d=\"M244 115L237 127.1H223L216 115L223 102.9H237Z\" fill=\"#F0655A\"></path><circle cx=\"230\" cy=\"115\" r=\"4\" fill=\"#15171C\"></circle>\n<text x=\"160\" y=\"205\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\" text-anchor=\"middle\">vis de la couleur rouge</text>\n</svg>"
  },
  {
    station: 6, label: "Écrous", answer: "faux",
    explanation: "Les 3 écrous sont de la même couleur que les vis.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linejoin=\"round\">\n<rect x=\"40\" y=\"55\" width=\"240\" height=\"120\" rx=\"10\" fill=\"#C9A36A\" fill-opacity=\".22\" stroke=\"#C9A36A\" stroke-width=\"2\"></rect>\n<circle cx=\"62\" cy=\"115\" r=\"9\" fill=\"#F0655A\"></circle>\n<path d=\"M132 115L121 134.1H99L88 115L99 95.9H121Z\" fill=\"#F0655A\"></path><circle cx=\"110\" cy=\"115\" r=\"6\" fill=\"#15171C\"></circle>\n<path d=\"M184 115L177 127.1H163L156 115L163 102.9H177Z\" fill=\"#F5C84A\"></path><circle cx=\"170\" cy=\"115\" r=\"4\" fill=\"#15171C\"></circle>\n<path d=\"M244 115L237 127.1H223L216 115L223 102.9H237Z\" fill=\"#F0655A\"></path><circle cx=\"230\" cy=\"115\" r=\"4\" fill=\"#15171C\"></circle>\n<text x=\"160\" y=\"205\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\" text-anchor=\"middle\">vis de la couleur rouge</text>\n</svg>"
  },
  {
    station: 6, label: "Écrous", answer: "faux",
    explanation: "1 gros et 2 petits, jamais 2 gros.",
    svg: "<svg width=\"310\" height=\"220\" viewBox=\"0 0 310 220\" fill=\"none\" stroke-linejoin=\"round\">\n<rect x=\"40\" y=\"55\" width=\"240\" height=\"120\" rx=\"10\" fill=\"#C9A36A\" fill-opacity=\".22\" stroke=\"#C9A36A\" stroke-width=\"2\"></rect>\n<circle cx=\"62\" cy=\"115\" r=\"9\" fill=\"#F0655A\"></circle>\n<path d=\"M132 115L121 134.1H99L88 115L99 95.9H121Z\" fill=\"#F0655A\"></path><circle cx=\"110\" cy=\"115\" r=\"6\" fill=\"#15171C\"></circle>\n<path d=\"M192 115L181 134.1H159L148 115L159 95.9H181Z\" fill=\"#F0655A\"></path><circle cx=\"170\" cy=\"115\" r=\"6\" fill=\"#15171C\"></circle>\n<path d=\"M244 115L237 127.1H223L216 115L223 102.9H237Z\" fill=\"#F0655A\"></path><circle cx=\"230\" cy=\"115\" r=\"4\" fill=\"#15171C\"></circle>\n<text x=\"160\" y=\"205\" fill=\"#9AA0AC\" font-family=\"Manrope\" font-weight=\"700\" font-size=\"14\" text-anchor=\"middle\">vis de la couleur rouge</text>\n</svg>"
  }
];
