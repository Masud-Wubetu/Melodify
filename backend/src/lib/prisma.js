const { PrismaClient } = require('@prisma/client');
const { neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

// Required: configure Neon to use the 'ws' package for WebSocket connections in Node.js
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.');
}

// PrismaNeon (v7+) is a factory — it takes a config object and creates the Pool internally.
// Do NOT pass a Pool instance directly.
const adapter = new PrismaNeon({ connectionString });

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
