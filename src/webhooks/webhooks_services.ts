import * as paymentRepository from '../modules/payments/payment_repository.js';
import { webhookPayload } from '../modules/payments/payment_types.js';

export const processWebhook=async(payload:webhookPayload):Promise<void> =>{

    const{
        output_ResponseCode,
        output_TransactionID,
        output_ConversationID,
        output_ThirdPartyReference
    }=payload;

    //find payment by third party reference
    const payment=await paymentRepository.findByThirdPartyReference(output_ThirdPartyReference);
    
    //log if reference unknown
    if(!payment){
        console.error("Webhook received for unknown payment reference:",output_ThirdPartyReference);
        return;
    }

    //skip if already processed to ensure idempotency
    if(payment.status==='COMPLETED'||payment.status==='FAILED'){
        console.log('Webhook already processed for payment:',payment.id,'\n skipping update');
        return;
    }
    
    //map mpesa code to internal status - INS-0 means success, anything else is failure
    const status=output_ResponseCode==="INS-0"?"COMPLETED":"FAILED";

    //update payment record in db
    await paymentRepository.update(payment.id,{
        status,
        mpesa_transaction_id:output_TransactionID,
        mpesa_conversation_id:output_ConversationID
    });

    console.log('Updated payment:',
        { payment_id: payment.id, 
            status,
            output_transaction_id:output_TransactionID,
        });
};