import * as paymentRepository from './payment_repository.js';
import * mpesaGateway from '../../services/mpesa_gateway.js';
import { createPaymentDTO, Payment, updatePaymentDTO } from './payment_types.js';

export const createPayment=async (data:createPaymentDTO):Promise<Payment> =>{

    //check indempotency
    const existing_payment= await paymentRepository.findByIdempotencyKey(data.idempotency_key);
    if(existing_payment){
        return existing_payment;
    } 

    //create payment record with PENDING status
    const payment= await paymentRepository.create(data);

    //init MPesa payment
    try{
        await mpesaGateway.initiatePayment({
            amount:data.amount,
            customer_msisdn:data.customer_msisdn,
            transaction_reference:data.transaction_reference,
            third_party_reference:data.third_party_reference,
            service_provider_code:process.env.MPESA_SERVICE_PROVIDER_CODE||'000000',
        });
    }catch(error){

        //if failed after retries, change status to FAILED
        await paymentRepository.update(payment.id,{status:'FAILED'});
        throw error;
    }
    return payment;
};

export const getPayment=async(id:string):Promise<Payment | null> =>{
    return paymentRepository.findById(id);
}
