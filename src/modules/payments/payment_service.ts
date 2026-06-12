import * as paymentRepository from './payment_repository.js';
// import { initiatePayment } from '../../gateways/mpesa_gateway.js'; // Comentado para o MVP
import { createPaymentDTO, Payment } from './payment_types.js';

export const createPayment = async (data: createPaymentDTO): Promise<Payment> => {
    const existing_payment = await paymentRepository.findByIdempotencyKey(data.idempotency_key);
    if (existing_payment) return existing_payment;

    const payment = await paymentRepository.create(data);

    try {
        console.log(`[MOCK GATEWAY] Simular envio de USSD Push para o número: ${data.customer_msisdn} no valor de ${data.amount} MZN`);
        
        /* 
        // MOCK DE PRODUÇÃO: Desativado temporariamente para a apresentação de Front-end
        await initiatePayment({
            amount: data.amount,
            customer_msisdn: data.customer_msisdn,
            transaction_reference: data.transaction_reference,
            third_party_reference: data.third_party_reference,
            service_provider_code: process.env.MPESA_SERVICE_PROVIDER_CODE || '171717',
        });
        */
        
        
        console.log('[MOCK GATEWAY] API do M-Pesa respondeu com Sucesso (Simulado).');
        
        return payment;
    } catch (error) {
        console.error('Falha ao iniciar pagamento M-Pesa:', error);
        await paymentRepository.update(payment.id, { status: 'FAILED' });
        throw error;
    }
};

export const updatePaymentStatus = async (reference: string, status: 'COMPLETED' | 'FAILED', mpesaTransactionId?: string) => {
    console.log(`Atualizando status do pagamento com referência ${reference} para ${status}`);
    return await paymentRepository.updateByReference(reference, {
        status: status,
        mpesa_transaction_id: mpesaTransactionId,
        updated_at: new Date(),
    });
};

export const getPayment = async (id: string): Promise<Payment | null> => {
    return paymentRepository.findById(id);
};
