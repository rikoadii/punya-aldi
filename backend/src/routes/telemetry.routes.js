const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetry.controller');

router.get('/live', telemetryController.getLive);
router.post('/', telemetryController.ingestTelemetry);

module.exports = router;
