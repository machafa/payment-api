export type paymentStatus='PENDING'|'COMPLETED'|'FAILED';
export type paymentMethod='MPESA';

export interface Payment{
    id:string;
    amount:number;
    method:paymentMethod;
    status:paymentStatus;
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
    method:paymentMethod;
    customer_msisdn:string;
    transaction_reference:string;
    third_party_reference:string;
    idempotency_key:string;
}

export interface updatePaymentDTO{
    status:paymentStatus;
    mpesa_transaction_id?:string;
    mpesa_conversation_id?:string;
}

export interface webhookPayload{
    output_response_code:string;
    output_response_description:string;
    output_response_message:string;
    mpesa_transaction_id:string;
    mpesa_conversation_id:string;
    output_third_party_reference:string;
}