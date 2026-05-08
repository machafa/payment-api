import { jest } from '@jest/globals';

process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/test_db';
process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test_key';
// 2.
jest.mock('../../modules/payments/payment_repository');
jest.mock('../../gateways/mpesa_gateway');

// 3. 
import * as paymentRepository from '../../modules/payments/payment_repository.js';
import * as mpesaGateway from '../../gateways/mpesa_gateway.js';
import * as paymentService from '../../modules/payments/payment_service.js';
import { mockPayment, mockMpesaSuccess } from './mock/mpesa_mock.js';

const mock_repository = paymentRepository as jest.Mocked<typeof paymentRepository>;
const mock_gateway = mpesaGateway as jest.Mocked<typeof mpesaGateway>;

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    const payment_data = {
      amount: 100,
      currency: 'MZN',
      method: 'MPESA' as const,
      customer_msisdn: '258841234567',
      transaction_reference: 'T1234567',
      third_party_reference: 'REF123',
      idempotency_key: 'test-key-001',
    };

    it('deve criar um pagamento com status PENDING', async () => {
      mock_repository.findByIdempotencyKey.mockResolvedValue(null);
      mock_repository.create.mockResolvedValue(mockPayment as any);
      mock_gateway.initiatePayment.mockResolvedValue(mockMpesaSuccess);

      const result = await paymentService.createPayment(payment_data);

      expect(result.status).toBe('PENDING');
      expect(mock_repository.create).toHaveBeenCalledTimes(1);
      expect(mock_gateway.initiatePayment).toHaveBeenCalledTimes(1);
    });

    it('deve retornar pagamento existente se idempotency_key já existe', async () => {
      mock_repository.findByIdempotencyKey.mockResolvedValue(mockPayment as any);

      const result = await paymentService.createPayment(payment_data);

      expect(result.id).toBe(mockPayment.id);
      expect(mock_repository.create).not.toHaveBeenCalled();
      expect(mock_gateway.initiatePayment).not.toHaveBeenCalled();
    });

    it('deve marcar pagamento como FAILED se M-Pesa falhar', async () => {
      mock_repository.findByIdempotencyKey.mockResolvedValue(null);
      mock_repository.create.mockResolvedValue(mockPayment as any);
      mock_repository.update.mockResolvedValue({ ...mockPayment, status: 'FAILED' } as any);
      mock_gateway.initiatePayment.mockRejectedValue(new Error('M-Pesa timeout'));

      await expect(paymentService.createPayment(payment_data)).rejects.toThrow('M-Pesa timeout');
      expect(mock_repository.update).toHaveBeenCalledWith(mockPayment.id, { status: 'FAILED' });
    });
  });

  describe('getPayment', () => {
    it('deve retornar pagamento pelo id', async () => {
      mock_repository.findById.mockResolvedValue(mockPayment as any);

      const result = await paymentService.getPayment(mockPayment.id);

      expect(result?.id).toBe(mockPayment.id);
    });

    it('deve retornar null se pagamento não existir', async () => {
      mock_repository.findById.mockResolvedValue(null);

      const result = await paymentService.getPayment('id-inexistente');

      expect(result).toBeNull();
    });
  });
});