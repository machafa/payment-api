import * as paymentRepository from './payment_repository.js'; // Removido .js
import * as mpesaGateway from '../gateways/mpesa_gateway.js';    // Corrigido o import
import { createPaymentDTO, Payment } from './payment_types.js'; // Removido .js

export const createPayment = async (data: createPaymentDTO): Promise<Payment> => {

    // 1. Check idempotency
    // Essencial para evitar cobranças duplicadas no Vutomi/Ecofin
    const existing_payment = await paymentRepository.findByIdempotencyKey(data.idempotency_key);
    if (existing_payment) {
        return existing_payment;
    } 

    // 2. Create payment record with PENDING status
    // O registro nasce no banco antes de chamarmos a Vodacom
    const payment = await paymentRepository.create(data);

    // 3. Init MPesa payment
    try {
        await mpesaGateway.initiatePayment({
            amount: data.amount,
            customer_msisdn: data.customer_msisdn,
            transaction_reference: data.transaction_reference,
            third_party_reference: data.third_party_reference,
            service_provider_code: process.env.MPESA_SERVICE_PROVIDER_CODE || '171717', // '171717' é o padrão de teste
        });
        
        // Se o gateway não lançar erro, o pagamento continua PENDING até o Webhook/Callback
        return payment;

    } catch (error) {
        // 4. Se falhar na comunicação com a Vodacom, marcamos como FAILED
        console.error('Falha ao iniciar pagamento M-Pesa:', error);
        
        await paymentRepository.update(payment.id, { 
            status: 'FAILED',
            // Opcional: guardar a mensagem de erro no banco
        });

        throw error; // Repassa o erro para o Controller
    }
};

export const getPayment = async (id: string): Promise<Payment | null> => {
    return paymentRepository.findById(id);
};