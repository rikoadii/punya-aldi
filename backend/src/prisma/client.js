const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

// Pastikan variabel lingkungan termuat
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is missing');
}

let prisma;

try {
  const url = new URL(databaseUrl);
  let database = url.pathname.substring(1);
  if (database.includes('?')) {
    database = database.split('?')[0];
  }

  const adapter = new PrismaMariaDb({
    host: url.hostname || 'localhost',
    port: url.port ? parseInt(url.port, 10) : 3306,
    user: url.username || 'root',
    password: url.password ? decodeURIComponent(url.password) : '',
    database: database || 'banjir_rob',
    connectionLimit: 10
  });

  prisma = new PrismaClient({ adapter });
} catch (err) {
  console.error('Gagal menginisialisasi PrismaClient dengan adapter MySQL:', err);
  throw err;
}

module.exports = prisma;
