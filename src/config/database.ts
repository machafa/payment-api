import { Pool } from 'pg';
import { env } from './env.js';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  // Como Lead, evita dar process.exit(-1) em produção sem logs detalhados
  console.error('Unexpected error on idle client:', err);
});

export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    console.log('Query executed', {
      text,
      duration,
      rows: result.rowCount,
    });

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error; // Re-lança para o teu errorHandler no app.ts capturar
  }
};

export const getClient = () => pool.connect();

export default pool;