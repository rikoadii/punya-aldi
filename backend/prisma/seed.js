const prisma = require('../src/prisma/client');

async function main() {
  console.log('Seeding database...');

  // Hapus data lama jika ada
  await prisma.telemetryLog.deleteMany();
  await prisma.station.deleteMany();

  // Tambah Stasiun Sensor Utama (Pantai Marunda, Jakarta)
  const station = await prisma.station.create({
    data: {
      name: 'Stasiun Pantai Marunda',
      latitude: -6.0968,
      longitude: 106.9642,
    },
  });

  console.log(`Created Station: ${station.name} (${station.id})`);

  // Tambah data simulasi telemetri historis (24 jam terakhir)
  const baseTime = new Date();
  const logs = [];

  for (let i = 23; i >= 0; i--) {
    const time = new Date(baseTime.getTime() - i * 60 * 60 * 1000);
    // Simulasi water level naik turun antara 1.0 m sampai 2.8 m
    const waterLevel = 1.5 + Math.sin((24 - i) / 3) * 0.8 + Math.random() * 0.3;
    
    // Hitung rateOfRise sederhana
    let rateOfRise = 0;
    if (logs.length > 0) {
      rateOfRise = Math.max(0, (waterLevel - logs[logs.length - 1].waterLevel));
    }

    // Tentukan status & fuzzyValue tiruan untuk data historis
    let status = 'Aman';
    let fuzzyValue = 20.0;
    if (waterLevel > 2.5) {
      status = 'Awas';
      fuzzyValue = 85.0;
    } else if (waterLevel > 1.8) {
      status = 'Siaga';
      fuzzyValue = 55.0;
    }

    logs.push({
      stationId: station.id,
      waterLevel,
      rateOfRise,
      fuzzyValue,
      status,
      createdAt: time,
    });
  }

  // Batch insert telemetry log
  // Prisma tidak mendukung createMany pada BigInt autoincrement dengan cara standar di SQLite, 
  // tapi di MySQL aman. Kita gunakan loop biasa demi kompatibilitas dan logging yang jelas.
  for (const logData of logs) {
    await prisma.telemetryLog.create({
      data: logData,
    });
  }

  console.log(`Successfully seeded ${logs.length} telemetry logs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
