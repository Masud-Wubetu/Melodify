const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

// Configure Neon to use the 'ws' package for WebSockets in Node.js
neonConfig.webSocketConstructor = ws;

let dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/^"|"$/g, '') : '';
if (dbUrl && dbUrl.includes('-pooler')) {
    dbUrl = dbUrl.replace('-pooler', '');
}

// Debugging logs to verify env loading
console.log('--- PRISMA DEBUG ---');
console.log('DATABASE_URL defined:', !!dbUrl);
if (dbUrl) {
    console.log('DATABASE_URL length:', dbUrl.length);
    console.log('DATABASE_URL prefix:', dbUrl.substring(0, 15) + '...');
}
console.log('---------------------');

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaNeon(pool);

const prisma = new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
