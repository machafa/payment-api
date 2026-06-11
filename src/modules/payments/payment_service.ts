import * as paymentRepository from './payment_repository.js';
import { initiatePayment } from '../../gateways/mpesa_gateway.js'; 
import { createPaymentDTO, Payment } from './payment_types.js';

export const createPayment = async (data: createPaymentDTO): Promise<Payment> => {
    const existing_payment = await paymentRepository.findByIdempotencyKey(data.idempotency_key);
    if (existing_payment) return existing_payment;

    const payment = await paymentRepository.create(data);

    try {
        // Agora chama a função diretamente
        await initiatePayment({
            amount: data.amount,
            customer_msisdn: data.customer_msisdn,
            transaction_reference: data.transaction_reference,
            third_party_reference: data.third_party_reference,
            service_provider_code: process.env.MPESA_SERVICE_PROVIDER_CODE || '171717',
        });
        
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