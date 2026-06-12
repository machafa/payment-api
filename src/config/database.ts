// import { Pool } from 'pg';
import { env } from './env.js';

// MOCK DE PRODUÇÃO: Comentada a inicialização do Pool real para evitar quedas de conexão
/*
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});
*/

export const query = async (text: string, params?: unknown[]): Promise<any> => {
  const start = Date.now();
  const duration = Date.now() - start;

  console.log('[MOCK DB] Query intercetada localmente:', {
    text,
    duration,
    rows: 0,
  });

  return { rows: [], rowCount: 0 };
};

export const getClient = async (): Promise<any> => {
  console.log('[MOCK DB] getClient() intercetado localmente.');
  return {
    query: async () => ({ rows: [], rowCount: 0 }),
    release: () => console.log('[MOCK DB] Conexão simulada libertada.')
  };
};

const poolMock = {};
export default poolMock;
