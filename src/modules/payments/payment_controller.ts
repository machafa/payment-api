import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment_service.js';
import { createPaymentDTO,webhookPayload } from './payment_types.js';


export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Tratamento robusto do Header
    const idempotencyKeyRaw = req.headers['idempotency-key'];
    
    // Verificação explícita para satisfazer o compilador
    if (!idempotencyKeyRaw) {
      res.status(400).json({ error: 'Idempotency-Key header is required' });
      return;
    }

    const idempotency_key = Array.isArray(idempotencyKeyRaw)
      ? idempotencyKeyRaw[0]
      : (idempotencyKeyRaw as string);

    // 2. Mapeamento do DTO
    const data: createPaymentDTO = {
      amount: req.body.amount,
      currency: req.body.currency || 'MZN',
      method: req.body.method || 'MPESA',
      customer_msisdn: req.body.customer_msisdn,
      transaction_reference: req.body.transaction_reference || `T${Date.now()}`,
      third_party_reference: req.body.third_party_reference || `REF${Math.floor(Math.random() * 100000)}`,
      idempotency_key: idempotency_key,
    };

    const payment = await paymentService.createPayment(data);

    res.status(202).json({
      payment_id: payment.id,
      payment_status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      created_at: payment.created_at,
    });
  } catch (error) {
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

    console.log(`Processando Callback para Ref: ${output_ThirdPartyReference}`);

    if (output_ResponseCode === 'INS-0') {
      // we want this
      await paymentService.updatePaymentStatus(
        output_ThirdPartyReference, 
        'COMPLETED', 
        output_TransactionID
      );
      console.log(`Pagamento ${output_ThirdPartyReference} marcado como CONCLUÍDO.`);
    } else {
      // FALHA: (Utilizador cancelou, sem saldo, or something else) but we still want to update the status to FAILED and its gota be INS something
      await paymentService.updatePaymentStatus(output_ThirdPartyReference, 'FAILED');
      console.log(`Pagamento ${output_ThirdPartyReference} marcado como FALHADO.`);
    }

    res.status(200).json({ message: 'Callback processed' });
  } catch (error) {
    console.error('Erro ao atualizar DB no Callback:', error);
    res.status(200).json({ error: 'Logged' }); // 200 so mpesa doesnt resend the pay, until further update
  }
};

export const getPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Payment ID is required' });
      return;
    }

    // casting as string for the servico to avoid type issues
    const payment = await paymentService.getPayment(id as string);

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