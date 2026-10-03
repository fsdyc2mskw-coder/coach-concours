# MOCKUP_CR018_assets: the exact data of the memory game

Companion of `CHANGE_REQUEST_018_memory_game.md`. Copied from the approved mockup (2 October
2026). Copy these values as they are; do not redraw, rename or reorder anything.

## 1. The 11 stations (official order, French labels as shown in the app)

```
 id   label             pictogram (one SVG path, viewBox 0 0 24 24, stroke only, width 1.9,
                        round caps and joins, stroke = accent #3CE0A1)
 s1   Slalom            M4 21V5M12 21V5M20 21V5M1 13c2-4 4-4 5 0s4 4 6 0 4-4 6 0 3 4 5 0
 s2   Obstacle          M8 13h9v8H8zM3 19c0-10 16-11 18-4M2 7a2 2 0 1 0 4 0a2 2 0 1 0-4 0
 s3   Espaliers         M7 5v16M17 5v16M7 9h10M7 13h10M7 17h10M3 9c1-8 17-8 18 0
 s4   Mannequin         M2.8 15a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0M7.5 16h9M11 16l-2 4M14 16l2 4M13 8h8M18 5l3 3-3 3
 s5   Chariot           M3 8h12v8H3zM4.4 19a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0M10.4 19a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0M16 12h5M18.5 9.5l2.5 2.5-2.5 2.5
 s6   Écrous            M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9zM8.5 12a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0
 s7   Sac à la corde    M2 8c4 0 6 2 9 4M11 12l2-2h5l3 3v7H11z
 s8   Cerceaux          M2 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0M9 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0M16 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0M9.4 6.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0
 s9   Banc              M2 12h20M5 12v7M19 12v7M10 6.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0
 s10  Corde à sauter    M6 3v6M18 3v6M6 9c0 13 12 13 12 0
 s11  Raquette          M3.5 10a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0M13 14l7 7M7.8 3a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0
```

## 2. The floor plan (canonical, `02_Training_brain/rules/floor_plan.md` v1)

Room drawn as a rectangle of aspect 640 : 944 (width : height). Positions are box CENTRES as a
fraction of the room (0,0 = top left). The door and the athlete figure sit bottom left.

```
 id    nx     ny          id    nx     ny
 s1    .300   .793        s7    .395   .057
 s2    .617   .792        s8    .408   .282
 s3    .908   .676        s9    .122   .065
 s4    .705   .498        s10   .139   .367
 s5    .938   .275        s11   .131   .629
 s6    .773   .059        door + athlete   .070   .962
```

On a 390 px phone the mockup draws the room at x 12, y 96, 366 × 540 px; the dotted boxes are
62 × 62 px. A box that would cross the room border is shifted inside it (s5 on a 366 px room).

## 3. ORDRE and the tray order

Tray order (both PLAN and ORDRE): s7, s2, s10, s5, s1, s9, s4, s11, s3, s8, s6.

## 4. QUI MANQUE, the 3 rounds

```
 round  missing  choices shown (in this order)              explanation after the answer
 1      s6       Chariot, Écrous, Mannequin, Banc           Écrous vient après le chariot. Les deux alternent : 5 → 6 → 5 → 6.
 2      s9       Banc, Corde à sauter, Sac à la corde,      Le banc vient après les cerceaux et avant la corde à sauter.
                 Raquette
 3      s3       Obstacle, Espaliers, Slalom, Mannequin     Les espaliers viennent juste après l'obstacle.
```

## 5. RÈGLES, the 10 pictures

Each picture is a fixed SVG drawn in a 310 × 220 frame on a #15171C card. Answer buttons:
"✓ Correct" and "✗ Faux". After the answer the card border turns green (#3CE0A1) when she was
right, red (#F0655A) when not, and the explanation line appears.

```
 #   station label shown        answer    explanation
 1   1 · Slalom                 faux      Aller tout droit jusqu'au bout des piquets, retour en slalom.
 2   1 · Slalom                 correct   Aller tout droit, retour en slalom.
 3   8 · Cerceau BLEU           correct   Bleu : pied droit, dribble à droite.
 4   8 · Cerceau JAUNE          faux      Jaune : pieds joints, pas de dribble.
 5   8 · Cerceau ROUGE          faux      Rouge : pied gauche, dribble à gauche.
 6   2 · Obstacle               correct   5 passages à l'aller avec une balle, posée dans la boîte rouge. 4 au retour sans balle.
 7   2 · Obstacle               faux      La balle reste dans la boîte rouge. Le retour se fait sans balle.
 8   6 · Écrous                 correct   Une couleur : 1 gros et 2 petits, sur les 3 vis de cette couleur.
 9   6 · Écrous                 faux      Les 3 écrous sont de la même couleur que les vis.
 10  6 · Écrous                 faux      1 gros et 2 petits, jamais 2 gros.
```

### Scene 1

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M250 95v40M190 95v40M130 95v40M70 95v40" stroke="#F0655A" stroke-width="6"></path>
<path d="M30 115Q60 70 100 115T160 115T220 115T285 115" stroke="#F2F3F5" stroke-width="4"></path>
<path d="M273 105l12 10-12 10" stroke="#F2F3F5" stroke-width="4"></path>
<text x="30" y="72" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14">aller ▸</text>
<path d="M285 185H30M42 175l-12 10 12 10" stroke="#F2F3F5" stroke-width="4"></path>
<text x="285" y="210" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14" text-anchor="end">◂ retour</text>
</svg>
```

### Scene 2

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M30 45H285M273 35l12 10-12 10" stroke="#F2F3F5" stroke-width="4"></path>
<text x="30" y="28" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14">aller ▸</text>
<path d="M250 105v40M190 105v40M130 105v40M70 105v40" stroke="#F0655A" stroke-width="6"></path>
<path d="M285 125Q255 80 220 125T160 125T100 125T30 125" stroke="#F2F3F5" stroke-width="4"></path>
<path d="M42 115l-12 10 12 10" stroke="#F2F3F5" stroke-width="4"></path>
<text x="285" y="195" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14" text-anchor="end">◂ retour</text>
</svg>
```

### Scene 3

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linecap="round" stroke-linejoin="round">
<ellipse cx="135" cy="160" rx="100" ry="34" stroke="#4A8CFF" stroke-width="9"></ellipse>
<ellipse cx="150" cy="150" rx="13" ry="24" fill="#F2F3F5"></ellipse>
<text x="150" y="112" fill="#F2F3F5" font-family="Plus Jakarta Sans" font-weight="800" font-size="18" text-anchor="middle">D</text>
<circle cx="262" cy="70" r="20" fill="#F5A04A"></circle>
<path d="M242 70h40M262 50v40" stroke="#0A0B0E" stroke-width="2"></path>
<path d="M262 100v40M254 132l8 8 8-8" stroke="#F2F3F5" stroke-width="3"></path>
<text x="60" y="45" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14">◂ retour · dribble</text>
</svg>
```

### Scene 4

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linecap="round">
<ellipse cx="155" cy="150" rx="110" ry="38" stroke="#F5C84A" stroke-width="9"></ellipse>
<ellipse cx="135" cy="140" rx="13" ry="24" fill="#F2F3F5"></ellipse>
<text x="135" y="100" fill="#F2F3F5" font-family="Plus Jakarta Sans" font-weight="800" font-size="18" text-anchor="middle">G</text>
<path d="M175 95c10 8 10 22 0 30" stroke="#F2F3F5" stroke-width="3" stroke-dasharray="3 6"></path>
<text x="196" y="118" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14">un seul pied</text>
</svg>
```

### Scene 5

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linecap="round" stroke-linejoin="round">
<ellipse cx="135" cy="160" rx="100" ry="34" stroke="#F0655A" stroke-width="9"></ellipse>
<ellipse cx="150" cy="150" rx="13" ry="24" fill="#F2F3F5"></ellipse>
<text x="150" y="112" fill="#F2F3F5" font-family="Plus Jakarta Sans" font-weight="800" font-size="18" text-anchor="middle">D</text>
<circle cx="262" cy="70" r="20" fill="#F5A04A"></circle>
<path d="M242 70h40M262 50v40" stroke="#0A0B0E" stroke-width="2"></path>
<path d="M262 100v40M254 132l8 8 8-8" stroke="#F2F3F5" stroke-width="3"></path>
<text x="60" y="45" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14">◂ retour · dribble</text>
</svg>
```

### Scene 6

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linecap="round" stroke-linejoin="round">
<rect x="125" y="80" width="60" height="70" rx="6" fill="#1D2027" stroke="#4A8CFF" stroke-width="3"></rect>
<path d="M20 60H112M100 50l12 10-12 10" stroke="#F2F3F5" stroke-width="4"></path>
<text x="20" y="40" fill="#F2F3F5" font-family="Plus Jakarta Sans" font-weight="800" font-size="20">aller</text>
<circle cx="35" cy="80" r="11" fill="#D9F25A"></circle>
<text x="55" y="87" fill="#F2F3F5" font-family="Plus Jakarta Sans" font-weight="800" font-size="20">× 5</text>
<path d="M190 175H270M200 165l-10 10 10 10" stroke="#F2F3F5" stroke-width="4"></path>
<text x="215" y="160" fill="#F2F3F5" font-family="Plus Jakarta Sans" font-weight="800" font-size="20">retour</text>
<text x="215" y="210" fill="#F2F3F5" font-family="Plus Jakarta Sans" font-weight="800" font-size="20">× 4</text>
<circle cx="268" cy="203" r="11" stroke="#9AA0AC" stroke-width="2" stroke-dasharray="3 4"></circle>
<rect x="225" y="40" width="64" height="40" rx="6" fill="#F0655A"></rect>
<circle cx="241" cy="56" r="7" fill="#D9F25A"></circle><circle cx="257" cy="56" r="7" fill="#D9F25A"></circle><circle cx="273" cy="56" r="7" fill="#D9F25A"></circle><circle cx="249" cy="68" r="7" fill="#D9F25A"></circle><circle cx="265" cy="68" r="7" fill="#D9F25A"></circle>
</svg>
```

### Scene 7

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linecap="round" stroke-linejoin="round">
<rect x="120" y="120" width="70" height="80" rx="6" fill="#1D2027" stroke="#4A8CFF" stroke-width="3"></rect>
<path d="M120 145h70M120 170h70" stroke="#F2F3F5" stroke-opacity=".5" stroke-width="3"></path>
<path d="M250 150C240 60 80 60 60 150" stroke="#F2F3F5" stroke-width="4"></path>
<path d="M50 132l10 18 16-12" stroke="#F2F3F5" stroke-width="4"></path>
<circle cx="155" cy="72" r="14" fill="#D9F25A"></circle>
<path d="M141 72c6 4 22 4 28 0" stroke="#0A0B0E" stroke-width="2"></path>
<text x="155" y="30" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14" text-anchor="middle">◂ retour</text>
</svg>
```

### Scene 8

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linejoin="round">
<rect x="40" y="55" width="240" height="120" rx="10" fill="#C9A36A" fill-opacity=".22" stroke="#C9A36A" stroke-width="2"></rect>
<circle cx="62" cy="115" r="9" fill="#F0655A"></circle>
<path d="M132 115L121 134.1H99L88 115L99 95.9H121Z" fill="#F0655A"></path><circle cx="110" cy="115" r="6" fill="#15171C"></circle>
<path d="M184 115L177 127.1H163L156 115L163 102.9H177Z" fill="#F0655A"></path><circle cx="170" cy="115" r="4" fill="#15171C"></circle>
<path d="M244 115L237 127.1H223L216 115L223 102.9H237Z" fill="#F0655A"></path><circle cx="230" cy="115" r="4" fill="#15171C"></circle>
<text x="160" y="205" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14" text-anchor="middle">vis de la couleur rouge</text>
</svg>
```

### Scene 9

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linejoin="round">
<rect x="40" y="55" width="240" height="120" rx="10" fill="#C9A36A" fill-opacity=".22" stroke="#C9A36A" stroke-width="2"></rect>
<circle cx="62" cy="115" r="9" fill="#F0655A"></circle>
<path d="M132 115L121 134.1H99L88 115L99 95.9H121Z" fill="#F0655A"></path><circle cx="110" cy="115" r="6" fill="#15171C"></circle>
<path d="M184 115L177 127.1H163L156 115L163 102.9H177Z" fill="#F5C84A"></path><circle cx="170" cy="115" r="4" fill="#15171C"></circle>
<path d="M244 115L237 127.1H223L216 115L223 102.9H237Z" fill="#F0655A"></path><circle cx="230" cy="115" r="4" fill="#15171C"></circle>
<text x="160" y="205" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14" text-anchor="middle">vis de la couleur rouge</text>
</svg>
```

### Scene 10

```svg
<svg width="310" height="220" viewBox="0 0 310 220" fill="none" stroke-linejoin="round">
<rect x="40" y="55" width="240" height="120" rx="10" fill="#C9A36A" fill-opacity=".22" stroke="#C9A36A" stroke-width="2"></rect>
<circle cx="62" cy="115" r="9" fill="#F0655A"></circle>
<path d="M132 115L121 134.1H99L88 115L99 95.9H121Z" fill="#F0655A"></path><circle cx="110" cy="115" r="6" fill="#15171C"></circle>
<path d="M192 115L181 134.1H159L148 115L159 95.9H181Z" fill="#F0655A"></path><circle cx="170" cy="115" r="6" fill="#15171C"></circle>
<path d="M244 115L237 127.1H223L216 115L223 102.9H237Z" fill="#F0655A"></path><circle cx="230" cy="115" r="4" fill="#15171C"></circle>
<text x="160" y="205" fill="#9AA0AC" font-family="Manrope" font-weight="700" font-size="14" text-anchor="middle">vis de la couleur rouge</text>
</svg>
```
