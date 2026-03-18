const { PrismaClient } = require('@prisma/client');

// Neon Pooler often needs pgbouncer=true in the URL
let dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('neon.tech') && !dbUrl.includes('pgbouncer=true')) {
    const separator = dbUrl.includes('?') ? '&' : '?';
    dbUrl += `${separator}pgbouncer=true&connect_timeout=15`;
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
    log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
module.exports = prisma;
