import * as paymentRepository from '../modules/payments/payment_repository.js';
import { webhookPayload } from '../modules/payments/payment_types.js';

export const processWebhook=async(payload:webhookPayload):Promise<void> =>{

    const{
        output_response_code,
        output_transaction_id,
        output_conversation_id,
        output_third_party_reference
    }=payload;

    //find payment by third party reference
    const payment=await paymentRepository.findByThirdPartyReference(output_third_party_reference);
    
    if(!payment){
        console.error("Webhook received for unknown payment reference:",output_third_party_reference);
        return;
    }

    //know status based on INS- code
    const status=output_response_code==="INS-0"?"COMPLETED":"FAILED";

    //update payment record in db
    await paymentRepository.update(payment.id,{
        status,
        mpesa_transaction_id:output_transaction_id,
        mpesa_conversation_id:output_conversation_id
    });

    console.log('Updated payment:',
        { payment_id: payment.id, 
            status,
            output_transaction_id:output_transaction_id,
        });
};