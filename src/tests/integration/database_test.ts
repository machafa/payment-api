import pool from '../../config/database.js';

describe('Database Integration', () => {
  // Fecha a conexão após os testes para o Jest não ficar "pendurado"
  afterAll(async () => {
    await pool.end();
  });

  it('should connect to the database and return current time', async () => {
    const res = await pool.query('SELECT NOW()');
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].now).toBeDefined();
  });

  it('should be able to query the payments table', async () => {
    // Nota: Certifica-te que a tabela existe no teu ambiente de teste/CI
    try {
      const res = await pool.query('SELECT * FROM payments LIMIT 1');
      expect(res.rows).toBeDefined();
    } catch (error: any) {
      // Se a tabela não existir, o teste falha, o que está correto para o CI
      throw new Error(`Database check failed: ${error.message}`);
    }
  });
});