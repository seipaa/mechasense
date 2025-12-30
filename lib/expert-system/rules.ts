// lib/expert-system/rules.ts

/**
 * Damage Level:
 * A = Ringan
 * B = Sedang
 * C = Berat
 */
export type DamageLevel = "A" | "B" | "C";

/**
 * Rule interface untuk Forward Chaining
 */
export interface Rule {
  id: string;
  symptoms: number[];
  operator: "AND" | "OR";
  level: DamageLevel;
  damage: string;
  solution: string;
}

/**
 * RULE BASE
 * - OR  : aturan paralel (satu gejala cukup)
 * - AND : aturan sekuensial (kombinasi gejala)
 */
export const rules: Rule[] = [
  {
    id: "R1",
    symptoms: [1],
    operator: "OR",
    level: "A",
    damage: "Kapasitor / Gulungan / Supply Listrik",
    solution: "Ganti kapasitor, cek kontinuitas gulungan, ukur supply listrik, lakukan segera!"
  },
  {
    id: "R2",
    symptoms: [2],
    operator: "OR",
    level: "B",
    damage: "Kapasitor",
    solution: "Ganti kapasitor sesuai spesifikasi, lakukan segera!"
  },
  {
    id: "R3",
    symptoms: [3],
    operator: "OR",
    level: "A",
    damage: "Supply Listrik / Kapasitor",
    solution: "Ukur tegangan, ganti kapasitor, lakukan segera!"
  },
  {
    id: "R4",
    symptoms: [4],
    operator: "OR",
    level: "B",
    damage: "Gulungan",
    solution: "Kurangi beban, lakukan rewinding, lakukan segera!"
  },
  {
    id: "R5",
    symptoms: [5],
    operator: "OR",
    level: "C",
    damage: "Gulungan terbakar",
    solution: "Rewinding, cek cooling fan, lakukan sekarang!"
  },
  {
    id: "R6",
    symptoms: [6],
    operator: "OR",
    level: "B",
    damage: "Kelistrikan (Supply)",
    solution: "Ukur arus, perbaiki instalasi, lakukan segera!"
  },
  {
    id: "R7",
    symptoms: [7],
    operator: "OR",
    level: "B",
    damage: "Bearing",
    solution: "Alignment, greasing, atau ganti bearing, lakukan segera!"
  },
  {
    id: "R8",
    symptoms: [8],
    operator: "OR",
    level: "C",
    damage: "Mekanis",
    solution: "Cek komponen motor terutama bagian yang bergerak, lakukan sekarang!"
  },
  {
    id: "R9",
    symptoms: [9],
    operator: "OR",
    level: "C",
    damage: "Kapasitor",
    solution: "Ganti kapasitor, lakukan sekarang!"
  },
  {
    id: "R10",
    symptoms: [10],
    operator: "OR",
    level: "B",
    damage: "Kapasitor / Gulungan",
    solution: "Ukur kapasitor dan resistansi gulungan, lakukan segera!"
  },

  /* ===============================
     ATURAN SEKUENSIAL (AND RULES)
     =============================== */

  {
    id: "R11",
    symptoms: [10, 5],
    operator: "AND",
    level: "C",
    damage: "Kapasitor terbakar",
    solution: "Ganti kapasitor, lakukan sekarang!"
  },
  {
    id: "R12",
    symptoms: [7, 2],
    operator: "AND",
    level: "C",
    damage: "Gearbox miring",
    solution: "Benarkan posisi gearbox, lakukan sekarang!"
  },
  {
    id: "R13",
    symptoms: [4,6],
    operator: "AND",
    level: "B",
    damage: "Kerusakan pada wiring",
    solution: "Periksa Wiring Segera, lakukan segera!",
  },
  {
    id: "R14",
    symptoms: [5,6],
    operator: "AND",
    level: "B",
    damage: "Kerusakan pada mekanik",
    solution: "Periksa Beban dan Daya segera! biasanya overload, lakukan segera!",
  },
  {
    id: "R15",
    symptoms: [5,4,6],
    operator: "AND",
    level: "B",
    damage: "Kerusakan pada mekanik",
    solution: "Periksa Wiring, lakkukan segera!",
  }
];
