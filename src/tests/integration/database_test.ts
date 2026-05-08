import { jest } from '@jest/globals';
import pool from '../../config/database.js';


process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/test_db';
process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test_key';
process.env.MPESA_PUBLIC_KEY = 'test_public_key';
process.env.MPESA_API_URL = 'https://mock.mpesa.com';
process.env.MPESA_BASE_URL = 'https://api.sandbox.vm.co.mz:18352/ipg/v1x';
process.env.MPESA_SERVICE_PROVIDER_CODE ='171717';
// 2.
jest.mock('../../modules/payments/payment_repository');
jest.mock('../../gateways/mpesa_gateway');

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