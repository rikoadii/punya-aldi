/**
 * Fungsi untuk menghitung nilai keanggotaan kurva Trapesium/Segitiga
 */
function fuzzyMembership(x, a, b, c, d) {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > c && x < d) return (d - x) / (d - c);
  return 0;
}

/**
 * Fuzzifikasi Water Level (Tinggi Air dalam meter)
 * Rendah: 0 - 0.5 - 1.0
 * Sedang: 0.5 - 1.0 - 1.5 - 2.0
 * Tinggi: 1.5 - 2.0 - 10.0
 */
function fuzzifyWaterLevel(waterLevel) {
  return {
    rendah: fuzzyMembership(waterLevel, -1, 0, 0.5, 1.0),
    sedang: fuzzyMembership(waterLevel, 0.5, 1.0, 1.5, 2.0),
    tinggi: fuzzyMembership(waterLevel, 1.5, 2.0, 10, 10) // Asumsi maks tinggi 10m
  };
}

/**
 * Fuzzifikasi Rate of Rise (Laju Kenaikan dalam m/jam)
 * Lambat: 0 - 0.1 - 0.2
 * Sedang: 0.1 - 0.2 - 0.4 - 0.5
 * Cepat: 0.4 - 0.5 - 5.0
 */
function fuzzifyRateOfRise(rateOfRise) {
  return {
    lambat: fuzzyMembership(rateOfRise, -1, 0, 0.1, 0.2),
    sedang: fuzzyMembership(rateOfRise, 0.1, 0.2, 0.4, 0.5),
    cepat: fuzzyMembership(rateOfRise, 0.4, 0.5, 5, 5)
  };
}

/**
 * Logika Fuzzy Mamdani Utama
 * Mengembalikan objek: { fuzzyValue: Float, status: String }
 */
function calculateFuzzy(waterLevel, rateOfRise) {
  // 1. Fuzzifikasi
  const wlFuzzy = fuzzifyWaterLevel(waterLevel);
  const rorFuzzy = fuzzifyRateOfRise(rateOfRise);

  // 2. Evaluasi Rules (Mamdani Min-Max)
  // Aturan sederhana:
  // [Aman] -> R & L, R & S, S & L
  // [Siaga] -> R & C, S & S, T & L
  // [Awas] -> S & C, T & S, T & C
  
  const rules = {
    aman: Math.max(
      Math.min(wlFuzzy.rendah, rorFuzzy.lambat),
      Math.min(wlFuzzy.rendah, rorFuzzy.sedang),
      Math.min(wlFuzzy.sedang, rorFuzzy.lambat)
    ),
    siaga: Math.max(
      Math.min(wlFuzzy.rendah, rorFuzzy.cepat),
      Math.min(wlFuzzy.sedang, rorFuzzy.sedang),
      Math.min(wlFuzzy.tinggi, rorFuzzy.lambat)
    ),
    awas: Math.max(
      Math.min(wlFuzzy.sedang, rorFuzzy.cepat),
      Math.min(wlFuzzy.tinggi, rorFuzzy.sedang),
      Math.min(wlFuzzy.tinggi, rorFuzzy.cepat)
    )
  };

  // 3. Defuzzifikasi (Centroid / Sugeno Simplified)
  // Output weights: Aman = 25, Siaga = 50, Awas = 75
  const wAman = 25, wSiaga = 50, wAwas = 75;
  
  const numerator = (rules.aman * wAman) + (rules.siaga * wSiaga) + (rules.awas * wAwas);
  const denominator = rules.aman + rules.siaga + rules.awas;
  
  let crispValue = 0;
  if (denominator !== 0) {
    crispValue = numerator / denominator;
  }

  // 4. Penentuan Status
  let status = 'Aman';
  if (crispValue > 35 && crispValue <= 60) status = 'Siaga';
  else if (crispValue > 60) status = 'Awas';

  return {
    fuzzyValue: parseFloat(crispValue.toFixed(2)),
    status: status
  };
}

module.exports = {
  calculateFuzzy
};
