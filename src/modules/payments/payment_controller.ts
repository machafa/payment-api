import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment_service.js'; // Removido .js para padrão TS
import { createPaymentDTO } from './payment_types.js';

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Tratamento robusto do Header (Resolve o erro de string | string[])
    const idempotencyKeyRaw = req.headers['idempotency-key'];
    
    const idempotency_key = Array.isArray(idempotencyKeyRaw)
      ? idempotencyKeyRaw[0]
      : (idempotencyKeyRaw as string);

    if (!idempotency_key) {
      res.status(400).json({
        error: 'Idempotency-Key header is required'
      });
      return;
    }

    // 2. Mapeamento do DTO com valores padrão (Fallback)
    // Isso evita o erro INS-19 do M-Pesa se o front-end esquecer as referências
    const data: createPaymentDTO = {
      amount: req.body.amount,
      currency: req.body.currency || 'MZN',
      method: req.body.method || 'MPESA',
      customer_msisdn: req.body.customer_msisdn,
      transaction_reference: req.body.transaction_reference || `T${Date.now()}`,
      third_party_reference: req.body.third_party_reference || `REF${Math.floor(Math.random() * 100000)}`,
      idempotency_key: idempotency_key,
    };

    // 3. Chamada ao serviço
    const payment = await paymentService.createPayment(data);

    // 202 Accepted é o ideal para pagamentos assíncronos (M-Pesa)
    res.status(202).json({
      payment_id: payment.id,
      payment_status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      created_at: payment.created_at,
    });
  } catch (error) {
    next(error); // Encaminha para o seu Error Handler global
  }
};

export const getPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPayment(id);

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    res.status(200).json({
      payment_id: payment.id,
      payment_status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      customer_msisdn: payment.customer_msisdn,
      transaction_reference: payment.transaction_reference,
      third_party_reference: payment.third_party_reference,
      mpesa_transaction_id: payment.mpesa_transaction_id,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    });
  } catch (error) {
    next(error);
  }
};