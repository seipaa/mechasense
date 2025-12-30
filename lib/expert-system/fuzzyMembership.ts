// lib/expert-system/fuzzyMembership.ts

/**
 * Linguistic levels sesuai pilihan user
 */
export type FuzzyLevel = 'Tidak' | 'Jarang' | 'Ya';

/**
 * Mapping linguistic value → Certainty Factor
 * Pendekatan fuzzy singleton (diskrit)
 */
export const fuzzyLevelToValue = (level: FuzzyLevel): number => {
  switch (level) {
    case 'Tidak':
      return 0.0;
    case 'Jarang':
      return 0.5;
    case 'Ya':
      return 1.0;
    default:
      return 0.0;
  }
};

/**
 * Konversi nilai CF → label linguistik terdekat
 * (untuk interpretasi hasil diagnosis)
 */
export const valueToFuzzyLevel = (value: number): FuzzyLevel => {
  if (value < 0.2) return 'Tidak';
  if (value < 0.6) return 'Jarang';
  return 'Ya';
};

/**
 * Validasi nilai CF agar tetap di range [0,1]
 */
export const clampCF = (value: number): number => {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};
