const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com Supabase PostgreSQL usando connection string
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Testar conexão
pool.on('connect', () => {
    console.log('Conectado ao Supabase PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Erro na conexão com o banco:', err);
});

module.exports = pool;