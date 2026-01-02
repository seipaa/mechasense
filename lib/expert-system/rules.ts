export type DamageLevel = "A" | "B" | "C";

export interface Rule {
  id: string;
  symptoms: number[];
  operator: "OR";
  damageType: string; // THEN A–I
  level: DamageLevel;
  damage: string;
  solution: string;
}

export const rules: Rule[] = [
  {
    id: "R1",
    symptoms: [1],
    operator: "OR",
    damageType: "A",
    level: "A",
    damage: "Kerusakan pada kapasitor / gulungan/ supply listrik, motor tidak menghasilkan torsi awal akibat kerusakan pada kapasitor, gulungan start yang putus, atau suplai listrik yang tidak mengalir ke motor.",
    solution: "Periksa kondisi kapasitor start, cek kontinuitas gulungan, serta ukur tegangan suplai listrik. Ganti kapasitor apabila terbakar atau mengalami kerusakan. Perbaikan cepat dan pemeriksaan menyeluruh sangat penting agar motor dapat beroperasi kembali dengan normal."
  },
  {
    id: "R2",
    symptoms: [2],
    operator: "OR",
    damageType: "B",
    level: "B",
    damage: "Kerusakan pada supply / kapasitor, kerusakan pada kapasitor, motor gagal start meskipun arus masuk, akibat nilai kapasitor menurun atau kapasitor mengalami kerusakan.",
    solution: "Ganti kapasitor sesuai dengan spesifikasi yang ditentukan. Setelah penggantian, lakukan pengujian motor untuk memastikan kerusakan telah teratasi dan motor dapat berfungsi kembali secara normal. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R3",
    symptoms: [3],
    operator: "OR",
    damageType: "C",
    level: "A",
    damage: "Kerusakan pada gulungan, torsi motor tidak optimal akibat tegangan drop atau kapasitor melemah.",
    solution: "Solusi Periksa sumber listrik dan pastikan tegangan sesuai dengan spesifikasi motor. Jika terjadi penurunan tegangan, perbaiki atau ganti sumber listrik yang stabil. Selain itu, lakukan pemeriksaan pada sensor dan rangkaian kontrol untuk memastikan tidak terdapat gangguan yang menyebabkan kesalahan deteksi suplai. Ganti kapasitor sesuai dengan spesifikasi yang ditentukan. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R4",
    symptoms: [4],
    operator: "OR",
    damageType: "D",
    level: "B",
    damage: "Kerusakan pada gulungan terbakar, arus berlebih pada kumparan akibat beban berlebih atau terjadinya short winding pada gulungan.",
    solution: "Matikan motor dan lakukan pemeriksaan visual pada gulungan untuk mendeteksi kerusakan fisik seperti terbakar atau putus. Kurangi beban kerja motor dan lakukan proses rewinding apabila diperlukan. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R5",
    symptoms: [5],
    operator: "OR",
    damageType: "E",
    level: "C",
    damage: "Kerusakan pada gulungan terbakar, gulungan terbakar akibat isolasi kawat yang rusak karena panas berlebih, disebabkan oleh hubung singkat (short circuit) atau kerusakan pada cooling fan.",
    solution: "Periksa penyebab utama kerusakan, seperti overheating atau tegangan berlebih, agar kejadian serupa tidak terulang. Lakukan proses rewinding pada gulungan yang rusak serta periksa kondisi cooling fan untuk memastikan sistem pendinginan berfungsi dengan baik. Perbaikan cepat dan pemeriksaan menyeluruh sangat penting."
  },
  {
    id: "R6",
    symptoms: [6],
    operator: "OR",
    damageType: "F",
    level: "B",
    damage: "Kerusakan pada kelistrikan(supply), proteksi kelistrikan aktif akibat arus berlebih, yang disebabkan oleh hubung singkat atau beban berlebih.",
    solution: "Periksa tegangan dan arus input, pastikan sesuai spesifikasi, perbaiki instalasi atau sumber listrik yang bermasalah. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R7",
    symptoms: [7],
    operator: "OR",
    damageType: "G",
    level: "B",
    damage: "Kerusakan pada bearing, putaran motor tidak seimbang akibat bearing miring, aus, atau kekurangan pelumasan.",
    solution: "Lakukan penggantian bearing yang rusak, periksa komponen terkait untuk mencegah kerusakan berulang, lakukan alignment, pelumasan (greasing). Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R8",
    symptoms: [8],
    operator: "OR",
    damageType: "H",
    level: "C",
    damage: "Kerusakan pada mekanis, gesekan mekanis berlebih akibat komponen mekanis yang miring atau mengalami keausan.",
    solution: "Lakukan pemeriksaan pada komponen motor, terutama bagian yang bergerak, dan lakukan penyetelan atau penggantian jika diperlukan. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R9",
    symptoms: [9],
    operator: "OR",
    damageType: "I",
    level: "C",
    damage: "Kerusakan pada kapasitor, kerusakan fisik pada kapasitor akibat tegangan berlebih (overvoltage) atau usia kapasitor yang sudah tua.",
    solution: "Ganti kapasitor sesuai dengan spesifikasi yang ditentukan. Setelah penggantian, lakukan pengujian motor untuk memastikan kerusakan telah teratasi dan motor dapat berfungsi kembali secara normal. Perbaikan cepat dan pemeriksaan menyeluruh sangat penting."
  },
  {
    id: "R10",
    symptoms: [10],
    operator: "OR",
    damageType: "J",
    level: "B",
    damage: "Kerusakan pada kapasitor / gulungan, efisiensi motor menurun akibat kapasitor mengalami penurunan nilai atau lilitan gulungan melemah.",
    solution: "Lakukan pengukuran nilai kapasitor dan resistansi gulungan untuk memastikan keduanya masih sesuai spesifikasi. Ganti kapasitor atau lakukan perbaikan gulungan apabila hasil pengukuran tidak normal. Perbaikan ini harus segera dilakukan."
  }
];
