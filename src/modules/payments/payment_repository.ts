import { query, getClient } from '../../config/database.js'; // Mantém o .js
import { Payment, createPaymentDTO, updatePaymentDTO } from './payment_types.js'; // Mantém o .js
import { randomUUID } from 'crypto'; // Módulos internos não precisam de extensão

export const findByIdempotencyKey = async (key: string): Promise<Payment | null> => {
  const result = await query(
    'SELECT * FROM payments WHERE idempotency_key = $1',
    [key]
  );
  return result.rows[0] || null;
};

export const findById = async (id: string): Promise<Payment | null> => {
  const result = await query(
    'SELECT * FROM payments WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const create = async (data: createPaymentDTO): Promise<Payment> => {
  const id = randomUUID();

  const result = await query(
    `INSERT INTO payments (
      id,
      amount,
      currency,
      status,
      method,
      customer_msisdn,
      transaction_reference,
      third_party_reference,
      idempotency_key,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, 'PENDING', $4, $5, $6, $7, $8, NOW(), NOW()
    ) RETURNING *`,
    [
      id,
      data.amount,
      data.currency,
      data.method,
      data.customer_msisdn,
      data.transaction_reference,
      data.third_party_reference,
      data.idempotency_key,
    ]
  );

  return result.rows[0];
};

export const update = async (id: string, data: updatePaymentDTO): Promise<Payment> => {
  const result = await query(
    `UPDATE payments
     SET
       status = $1,
       mpesa_transaction_id = $2,
       mpesa_conversation_id = $3,
       updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [
      data.status,
      data.mpesa_transaction_id || null,
      data.mpesa_conversation_id || null,
      id,
    ]
  );

  return result.rows[0];
};

export const findByThirdPartyReference = async (reference: string): Promise<Payment | null> => {
  const result = await query(
    'SELECT * FROM payments WHERE third_party_reference = $1',
    [reference]
  );
  return result.rows[0] || null;
};