const prisma = require('../prisma/client');
const { calculateFuzzy } = require('./fuzzy.service');

async function processIncomingTelemetry(stationId, waterLevel) {
  // 1. Dapatkan log terakhir untuk menghitung rateOfRise
  const lastLog = await prisma.telemetryLog.findFirst({
    where: { stationId },
    orderBy: { createdAt: 'desc' }
  });

  let rateOfRise = 0;
  if (lastLog) {
    // Waktu dalam jam
    const timeDiffHours = (new Date() - new Date(lastLog.createdAt)) / (1000 * 60 * 60);
    if (timeDiffHours > 0) {
      rateOfRise = (waterLevel - lastLog.waterLevel) / timeDiffHours;
    }
  }

  // Hindari nilai negatif jika surut drastis untuk logika dasar (atau biarkan, tergantung rule)
  if (rateOfRise < 0) rateOfRise = 0;

  // 2. Hitung nilai fuzzy Mamdani
  const { fuzzyValue, status } = calculateFuzzy(waterLevel, rateOfRise);

  // 3. Simpan ke database
  const newLog = await prisma.telemetryLog.create({
    data: {
      stationId,
      waterLevel,
      rateOfRise,
      fuzzyValue,
      status
    }
  });

  // Karena ID adalah BigInt, kita perlu serialize jika dipassing ke JSON
  return {
    ...newLog,
    id: newLog.id.toString()
  };
}

async function getLiveTelemetry() {
  const stations = await prisma.station.findMany({
    include: {
      logs: {
        orderBy: { createdAt: 'desc' },
        take: 24 // Ambil 24 log terakhir untuk grafik
      }
    }
  });

  // Serialize BigInt to string
  return stations.map(station => {
    return {
      ...station,
      logs: station.logs.map(log => ({
        ...log,
        id: log.id.toString()
      }))
    }
  });
}

module.exports = {
  processIncomingTelemetry,
  getLiveTelemetry
};
