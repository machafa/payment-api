import pool from '../../config/database.js';

describe('Database Integration', () => {
  
  afterAll(async () => {
    try {
      await pool.end();
    } catch (err) {
      console.error('Erro ao fechar o pool:', err);
    }
  });

  it('should connect to the database and return current time', async () => {
    const res = await pool.query('SELECT NOW()');
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].now).toBeDefined();
  }, 15000); 

  it('should be able to query the payments table', async () => {
    try {
      const res = await pool.query('SELECT * FROM payments LIMIT 1');
      expect(res.rows).toBeDefined();
    } catch (error: any) {

      throw new Error(`Database check failed: ${error.message}`);
    }
  }, 10000); 
});