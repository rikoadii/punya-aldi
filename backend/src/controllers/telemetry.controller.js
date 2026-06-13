const telemetryService = require('../services/telemetry.service');

async function getLive(req, res) {
  try {
    const data = await telemetryService.getLiveTelemetry();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching live telemetry:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function ingestTelemetry(req, res) {
  try {
    const { stationId, waterLevel } = req.body;
    
    if (!stationId || waterLevel === undefined) {
      return res.status(400).json({ success: false, error: 'Missing stationId or waterLevel' });
    }

    const log = await telemetryService.processIncomingTelemetry(stationId, waterLevel);
    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Error ingesting telemetry:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  getLive,
  ingestTelemetry
};
