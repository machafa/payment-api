import request from 'supertest';
import app from '../../app.js';
import { jest } from '@jest/globals';

jest.mock('../../src/gateways/mpesa_gateway.js');
jest.mock('../../src/modules/payments/payment_repository.js');

import * as mpesaGateway from '../../gateways/mpesa_gateway.js';
import * as paymentRepository from '../../modules/payments/payment_repository.js';
import { mockPayment, mockMpesaSuccess } from '../unit/mock/mpesa_mock.js';

const mock_gateway = mpesaGateway as jest.Mocked<typeof mpesaGateway>;
const mock_repository = paymentRepository as jest.Mocked<typeof paymentRepository>;

const API_KEY = process.env.API_KEY || 'test-api-key';

describe('POST /api/v1/payments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 202 com pagamento PENDING', async () => {
    mock_repository.findByIdempotencyKey.mockResolvedValue(null);
    mock_repository.create.mockResolvedValue(mockPayment as any);
    mock_gateway.initiatePayment.mockResolvedValue(mockMpesaSuccess);

    const response = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${API_KEY}`)
      .set('Idempotency-Key', 'test-key-001')
      .send({
        amount: 100,
        currency: 'MZN',
        method: 'MPESA',
        customer_msisdn: '258841234567',
        transaction_reference: 'T1234567',
        third_party_reference: 'REF123',
      });

    expect(response.status).toBe(202);
    expect(response.body.payment_status).toBe('PENDING');
  });

  it('deve retornar 400 sem Idempotency-Key', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({
        amount: 100,
        currency: 'MZN',
        method: 'MPESA',
        customer_msisdn: '258841234567',
        transaction_reference: 'T1234567',
        third_party_reference: 'REF123',
      });

    expect(response.status).toBe(400);
  });

  it('deve retornar 401 sem Authorization', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .set('Idempotency-Key', 'test-key-001')
      .send({
        amount: 100,
        currency: 'MZN',
        method: 'MPESA',
        customer_msisdn: '258841234567',
        transaction_reference: 'T1234567',
        third_party_reference: 'REF123',
      });

    expect(response.status).toBe(401);
  });
});

describe('GET /api/v1/payments/:id', () => {
  it('deve retornar 200 com pagamento existente', async () => {
    mock_repository.findById.mockResolvedValue(mockPayment as any);

    const response = await request(app)
      .get(`/api/v1/payments/${mockPayment.id}`)
      .set('Authorization', `Bearer ${API_KEY}`);

    expect(response.status).toBe(200);
    expect(response.body.payment_id).toBe(mockPayment.id);
  });

  it('deve retornar 404 para pagamento inexistente', async () => {
    mock_repository.findById.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/v1/payments/id-inexistente')
      .set('Authorization', `Bearer ${API_KEY}`);

    expect(response.status).toBe(404);
  });
});

describe('POST /api/v1/webhooks/provider', () => {
  it('deve retornar 200 ao processar webhook', async () => {
    mock_repository.findByThirdPartyReference.mockResolvedValue(mockPayment as any);
    mock_repository.update.mockResolvedValue({ ...mockPayment, status: 'SUCCESS' } as any);

    const response = await request(app)
      .post('/api/v1/webhooks/provider')
      .send({
        output_ResponseCode: 'INS-0',
        output_ResponseDesc: 'Request processed successfully',
        output_TransactionID: 'TXN123',
        output_ConversationID: 'CONV123',
        output_ThirdPartyReference: 'REF123',
      });

    expect(response.status).toBe(200);
  });

  it('deve retornar 400 com payload inválido', async () => {
    const response = await request(app)
      .post('/api/v1/webhooks/provider')
      .send({});

    expect(response.status).toBe(400);
  });
});