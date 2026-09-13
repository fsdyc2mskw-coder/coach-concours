// CHANGE_REQUEST_008 — Stations test.
//
// Asserts docs/police-v1/examples/police-stations.json (the machine-readable
// seed referenced by docs/police-v1/OFFICIAL_CIRCUIT.md) has 11 entries in
// official order, that station 2 carries the 5-out/4-back tennis-ball rule,
// and that station 8 carries the three colour mappings.
//
// NOTE on "word for word against the official source": the CR text (and
// OFFICIAL_CIRCUIT.md) names docs/POLICE_TEST.md as the source of facts.
// police-stations.json is authored in French; POLICE_TEST.md is authored in
// English (itself a translation/summary of the real official French
// documents). They cannot be literally identical strings in two languages,
// so this file checks the same facts (order, the 5/4 count, the 3 colours,
// the critical rules) rather than byte-for-byte text equality. See
// handoffs/APP_REPORT_008.md for this discrepancy.
import { describe, expect, it } from 'vitest';
import stationsCatalog from '../../docs/police-v1/examples/police-stations.json';

interface StationRecord {
  id: string;
  order: number;
  name: string;
  officialSteps: string[];
  officialFacts: string[];
  criticalRules: string[];
}

const stations = stationsCatalog.stations as StationRecord[];

describe('official station catalogue (docs/police-v1/examples/police-stations.json)', () => {
  it('has exactly 11 stations, in official order 1-11', () => {
    expect(stations).toHaveLength(11);
    expect(stations.map((station) => station.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('station 2 carries the 5-out / 4-back tennis-ball rule', () => {
    const station2 = stations.find((station) => station.order === 2)!;
    expect(station2.name).toBe('Franchissement obstacle');
    expect(station2.officialFacts.join(' ')).toContain('Cinq franchissements');
    expect(station2.officialFacts.join(' ')).toContain('quatre au retour sans balle');
    expect(station2.criticalRules.join(' ')).toContain('5 avec balle et 4 sans balle');
  });

  it('station 8 carries the three colour mappings (yellow/blue/red)', () => {
    const station8 = stations.find((station) => station.order === 8)!;
    expect(station8.name).toBe('Cerceaux et ballon');
    expect(station8.officialFacts).toHaveLength(3);
    expect(station8.officialFacts[0]).toMatch(/^Jaune/);
    expect(station8.officialFacts[1]).toMatch(/^Bleu/);
    expect(station8.officialFacts[2]).toMatch(/^Rouge/);
  });

  it('every station has a stable id matching its order and a non-empty name', () => {
    for (const station of stations) {
      expect(station.id).toContain(String(station.order).padStart(2, '0'));
      expect(station.name.length).toBeGreaterThan(0);
    }
  });
});
