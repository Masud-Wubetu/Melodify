const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('SUCCESS: Connected to PostgreSQL');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('QUERY OK:', res.rows[0]);
    return client.end();
  })
  .catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
