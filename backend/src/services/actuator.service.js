const mqtt = require('mqtt');
require('dotenv').config();

const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://test.mosquitto.org';
const topic = process.env.MQTT_TOPIC_ACTUATOR || 'banjir_rob/actuator/toggle';

let client;

function initMqtt() {
  client = mqtt.connect(brokerUrl);

  client.on('connect', () => {
    console.log(`Connected to MQTT broker at ${brokerUrl}`);
  });

  client.on('error', (err) => {
    console.error('MQTT connection error:', err);
  });
}

function publishActuatorToggle(state) {
  if (!client) {
    throw new Error('MQTT client is not initialized');
  }

  const payload = JSON.stringify({ state });
  
  return new Promise((resolve, reject) => {
    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('Failed to publish MQTT message', err);
        return reject(err);
      }
      console.log(`MQTT Published to ${topic}: ${payload}`);
      resolve(true);
    });
  });
}

module.exports = {
  initMqtt,
  publishActuatorToggle
};
