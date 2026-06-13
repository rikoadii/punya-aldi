const express = require('express');
const router = express.Router();
const actuatorController = require('../controllers/actuator.controller');

router.post('/toggle', actuatorController.toggleActuator);

module.exports = router;
