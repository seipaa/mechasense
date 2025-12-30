// lib/expert-system/diagnosisEngine.ts

import { rules } from "./rules";
import { symptoms } from "./symptoms";
import { FuzzyLevel, fuzzyLevelToValue } from "./fuzzyMembership";

/* =======================
   TYPES
======================= */

export interface DiagnosisResult {
  level: "A" | "B" | "C";
  damage: string;
  solution: string;
  confidence: number; // 0.0 - 1.0
}

export type UserAnswer = FuzzyLevel;

export type UserAnswers = Record<number, UserAnswer>;

/* =======================
   DIAGNOSIS ENGINE
======================= */

export function diagnoseForward(
  answers: UserAnswers
): DiagnosisResult[] {

  /* =======================
     1️⃣ HITUNG EVIDENCE CF
  ======================= */
  const evidenceCF = new Map<number, number>();

  for (const symptom of symptoms) {
    const answer = answers[symptom.id];
    if (!answer) continue;

    const cfUser = fuzzyLevelToValue(answer); // 0 / 0.4 / 0.8
    const cfEvidence = cfUser * symptom.cfExpert;

    if (cfEvidence > 0) {
      evidenceCF.set(symptom.id, cfEvidence);
    }
  }

  /* =======================
     2️⃣ PROSES AND RULE (PRIORITAS)
  ======================= */
  const andResults: DiagnosisResult[] = [];

  for (const rule of rules) {
    if (rule.operator !== "AND") continue;

    const cfList: number[] = [];

    for (const sid of rule.symptoms) {
      if (evidenceCF.has(sid)) {
        cfList.push(evidenceCF.get(sid)!);
      }
    }

    // FULL MATCH AND
    if (cfList.length === rule.symptoms.length) {
      const ruleCF = Math.min(...cfList);

      if (ruleCF > 0) {
        andResults.push({
          level: rule.level,
          damage: rule.damage,
          solution: rule.solution,
          confidence: Number(ruleCF.toFixed(3))
        });
      }
    }
  }

  // Jika AND rule ditemukan → ambil yang PALING SPESIFIK
  if (andResults.length > 0) {
    const priority = { C: 3, B: 2, A: 1 };

    return andResults
      .sort((a, b) => priority[b.level] - priority[a.level])
      .slice(0, 1); // ambil 1 paling kuat
  }

  /* =======================
     3️⃣ PROSES OR RULE (FALLBACK)
  ======================= */
  const orResults: DiagnosisResult[] = [];

  for (const rule of rules) {
    if (rule.operator !== "OR") continue;

    const cfList: number[] = [];

    for (const sid of rule.symptoms) {
      if (evidenceCF.has(sid)) {
        cfList.push(evidenceCF.get(sid)!);
      }
    }

    if (cfList.length > 0) {
      const ruleCF = Math.max(...cfList);

      if (ruleCF > 0) {
        orResults.push({
          level: rule.level,
          damage: rule.damage,
          solution: rule.solution,
          confidence: Number(ruleCF.toFixed(3))
        });
      }
    }
  }

  /* =======================
     4️⃣ SORT LEVEL PRIORITY
  ======================= */
  const priority = { C: 3, B: 2, A: 1 };

  return orResults.sort(
    (a, b) => priority[b.level] - priority[a.level]
  );
}