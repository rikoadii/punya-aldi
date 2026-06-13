const actuatorService = require('../services/actuator.service');

async function toggleActuator(req, res) {
  try {
    const { state } = req.body;
    
    if (typeof state !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Invalid state parameter. Must be boolean.' });
    }

    await actuatorService.publishActuatorToggle(state);
    
    res.json({ success: true, message: `Actuator state toggled to ${state}` });
  } catch (error) {
    console.error('Error toggling actuator:', error);
    res.status(500).json({ success: false, error: 'Failed to publish to MQTT' });
  }
}

module.exports = {
  toggleActuator
};
