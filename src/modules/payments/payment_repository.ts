import { Payment, createPaymentDTO, updatePaymentDTO } from './payment_types.js'; 
import { randomUUID } from 'crypto';

// Tabela simulada em memória usando um Map nativo do TypeScript
const paymentsMockTable = new Map<string, Payment>();

export const findByIdempotencyKey = async (key: string): Promise<Payment | null> => {
  console.log(`[MOCK DB] Verificar chave de idempotência: ${key}`);
  
  for (const payment of paymentsMockTable.values()) {
    if (payment.idempotency_key === key) {
      console.log(`[MOCK DB] Idempotência detetada para a chave: ${key}`);
      return payment;
    }
  }
  return null;
};

export const findById = async (id: string): Promise<Payment | null> => {
  console.log(`[MOCK DB] Procurar por ID: ${id}`);
  return paymentsMockTable.get(id) || null;
};

export const create = async (data: createPaymentDTO): Promise<Payment> => {
  const id = randomUUID();

  const newPayment: Payment = {
    id,
    amount: data.amount,
    currency: data.currency || 'MZN',
    status: 'PENDING',
    method: data.method || 'MPESA',
    customer_msisdn: data.customer_msisdn,
    transaction_reference: data.transaction_reference,
    third_party_reference: data.third_party_reference,
    idempotency_key: data.idempotency_key,
    mpesa_transaction_id: null,
    mpesa_conversation_id: null,
    created_at: new Date(),
    updated_at: new Date()
  };

  paymentsMockTable.set(id, newPayment);
  console.log(`[MOCK DB] Pagamento criado em memória. ID: ${id}`);
  return newPayment;
};

export const update = async (id: string, data: updatePaymentDTO): Promise<Payment> => {
  console.log(`[MOCK DB] Atualizar pagamento ID: ${id}`);
  const payment = paymentsMockTable.get(id);

  if (!payment) {
    throw new Error(`Payment with ID ${id} not found in mock database`);
  }

  const updatedPayment: Payment = {
    ...payment,
    status: data.status,
    mpesa_transaction_id: data.mpesa_transaction_id || payment.mpesa_transaction_id,
    mpesa_conversation_id: data.mpesa_conversation_id || payment.mpesa_conversation_id,
    updated_at: new Date()
  };

  paymentsMockTable.set(id, updatedPayment);
  return updatedPayment;
};

export const findByThirdPartyReference = async (reference: string): Promise<Payment | null> => {
  console.log(`[MOCK DB] Procurar por Third Party Reference: ${reference}`);
  for (const payment of paymentsMockTable.values()) {
    if (payment.third_party_reference === reference) {
      return payment;
    }
  }
  return null;
};

export const updateByReference = async (
  reference: string, 
  data: { status: string; mpesa_transaction_id?: string; updated_at: Date }
): Promise<Payment> => {
  console.log(`[MOCK DB] Atualizar por Referência: ${reference}`);
  
  let targetPayment: Payment | null = null;
  
  for (const payment of paymentsMockTable.values()) {
    if (payment.third_party_reference === reference) {
      targetPayment = payment;
      break;
    }
  }

  if (!targetPayment) {
    throw new Error(`Payment with reference ${reference} not found in mock database`);
  }

  const updatedPayment: Payment = {
    ...targetPayment,
    status: data.status,
    mpesa_transaction_id: data.mpesa_transaction_id || targetPayment.mpesa_transaction_id,
    updated_at: data.updated_at
  };

  paymentsMockTable.set(updatedPayment.id, updatedPayment);
  return updatedPayment;
};
