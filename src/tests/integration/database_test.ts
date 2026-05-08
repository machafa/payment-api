import pool from '../../config/database.js';

describe('Database Integration', () => {
  // close conection after jost 
  afterAll(async () => {
    await pool.end();
  });

  it('should connect to the database and return current time', async () => {
    const res = await pool.query('SELECT NOW()');
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].now).toBeDefined();
  });

  it('should be able to query the payments table', async () => {
    // make sure the table exists in your test env
    try {
      const res = await pool.query('SELECT * FROM payments LIMIT 1');
      expect(res.rows).toBeDefined();
    } catch (error: any) {
      // if the table doesnt exist, test will fail
      throw new Error(`Database check failed: ${error.message}`);
    }
  });
});