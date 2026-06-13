require('dotenv').config();
const app = require('./app');
const prisma = require('./prisma/client');
const actuatorService = require('./services/actuator.service');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('Connected to Prisma MySQL database.');

    // Initialize MQTT Connection
    actuatorService.initMqtt();

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
