const express = require('express');
const cors = require('cors');

const telemetryRoutes = require('./routes/telemetry.routes');
const actuatorRoutes = require('./routes/actuator.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/actuator', actuatorRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.json({ message: 'Monitoring Banjir Rob API is running (No Auth).' });
});

module.exports = app;
