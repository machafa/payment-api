export type payment_status='PENDING'|'COMPLETED'|'FAILED';
export type payment_method='MPESA';

export interface Payment{
    id:string;
    amount:number;
    currency:string;
    method:payment_method;
    status:payment_status;
    customer_msisdn:string;
    transaction_reference:string;
    third_party_reference:string;
    idempotency_key:string;
    mpesa_transaction_id?:string;
    mpesa_conversation_id?:string;
    created_at:Date;
    updated_at:Date;
}

export interface createPaymentDTO{
    amount:number;
    currency:string;
    method:payment_method;
    customer_msisdn:string;
    transaction_reference:string;
    third_party_reference:string;
    idempotency_key:string;
}

export interface updatePaymentDTO{
    status:payment_status;
    mpesa_transaction_id?:string;
    mpesa_conversation_id?:string;
}

export interface webhookPayload{
    output_ResponseCode:string;
    output_ResponseDescription:string;
    output_ResponseMessage:string;
    output_TransactionID:string;
    output_ConversationID:string;
    output_ThirdPartyReference:string;
}