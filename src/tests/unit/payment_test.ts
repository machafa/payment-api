import { Payment } from '../../modules/payments/payment_types.js';

describe('Payment Types Logic', () => {
  it('should validate a payment object structure', () => {
    const mockPayment: Payment = {
      id: '123',
      amount: 100,
      method: 'MPESA',
      status: 'PENDING',
      customer_msisdn: '841234567',
      transaction_reference: 'REF-001',
      third_party_reference: '3RD-001',
      idempotency_key: 'ik-123',
      created_at: new Date(),
      updated_at: new Date()
    };

    expect(mockPayment.amount).toBeGreaterThan(0);
    expect(mockPayment.method).toBe('MPESA');
  });
});