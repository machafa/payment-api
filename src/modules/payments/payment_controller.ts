import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment_service.js';
import { createPaymentDTO, webhookPayload } from './payment_types.js';
import logger from '../../utils/logger.js'; // Importa o logger estruturado

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const correlationId = `req-${Date.now()}`; // Para rastrear o fluxo completo no log

  try {
    const idempotencyKeyRaw = req.headers['idempotency-key'];
    
    if (!idempotencyKeyRaw) {
      logger.warn({ path: req.path, method: req.method }, 'Tentativa de pagamento sem Idempotency-Key');
      res.status(400).json({ error: 'Idempotency-Key header is required' });
      return;
    }

    const idempotency_key = Array.isArray(idempotencyKeyRaw)
      ? idempotencyKeyRaw[0]
      : (idempotencyKeyRaw as string);

    const data: createPaymentDTO = {
      amount: req.body.amount,
      currency: req.body.currency || 'MZN',
      method: req.body.method || 'MPESA',
      customer_msisdn: req.body.customer_msisdn,
      transaction_reference: req.body.transaction_reference || `T${Date.now()}`,
      third_party_reference: req.body.third_party_reference || `REF${Math.floor(Math.random() * 100000)}`,
      idempotency_key: idempotency_key,
    };

    logger.info({ 
      correlationId, 
      idempotency_key, 
      ref: data.transaction_reference 
    }, 'Iniciando criação de pagamento');

    const payment = await paymentService.createPayment(data);

    logger.info({ 
      correlationId, 
      payment_id: payment.id, 
      status: payment.status 
    }, 'Pagamento criado com sucesso');

    res.status(202).json({
      payment_id: payment.id,
      payment_status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      created_at: payment.created_at,
    });
  } catch (error) {
    logger.error({ correlationId, error: (error as Error).message }, 'Erro crítico em createPayment');
    next(error);
  }
};

export const handleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as webhookPayload;
    const { output_ResponseCode, output_ThirdPartyReference, output_TransactionID } = data;

    // Log estruturado com o payload recebido do M-Pesa
    logger.info({ 
      ref: output_ThirdPartyReference, 
      mpesa_tid: output_TransactionID, 
      code: output_ResponseCode 
    }, 'Recebido Callback do M-Pesa');

    if (output_ResponseCode === 'INS-0') {
      await paymentService.updatePaymentStatus(
        output_ThirdPartyReference, 
        'COMPLETED', 
        output_TransactionID
      );
      logger.info({ ref: output_ThirdPartyReference }, 'Status do pagamento atualizado para COMPLETED');
    } else {
      await paymentService.updatePaymentStatus(output_ThirdPartyReference, 'FAILED');
      logger.warn({ 
        ref: output_ThirdPartyReference, 
        code: output_ResponseCode 
      }, 'Pagamento falhou no provedor');
    }

    res.status(200).json({ message: 'Callback processed' });
  } catch (error) {
    logger.error({ 
      error: (error as Error).message, 
      payload: req.body 
    }, 'Erro ao processar callback do M-Pesa');
    
    // Mantemos o 200 para evitar retentativas infinitas do M-Pesa se o erro for de lógica
    res.status(200).json({ error: 'Processed with internal log' });
  }
};

export const getPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Verificação de segurança (Type Guard)
    if (!id || typeof id !== 'string') {
      logger.warn({ path: req.path }, 'Tentativa de busca com ID inválido');
      res.status(400).json({ error: 'Valid Payment ID is required' });
      return;
    }

    // 2. Agora o TS sabe que 'id' é estritamente uma string
    const payment = await paymentService.getPayment(id);

    if (!payment) {
      logger.warn({ payment_id: id }, 'Pagamento não encontrado');
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
    logger.error({ error: (error as Error).message, payment_id: req.params.id }, 'Erro ao buscar pagamento');
    next(error);
  }
};