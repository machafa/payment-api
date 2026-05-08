import crypto from 'crypto';
import { env } from '../config/env.js';

interface MpesaPaymentRequest {
  amount: number;
  customer_msisdn: string;
  service_provider_code: string;
  transaction_reference: string;
  third_party_reference: string;
}

// Corrigido para bater com o JSON da Vodacom (Case Sensitive)
interface MpesaPaymentResponse {
  output_ResponseCode: string;
  output_ResponseDesc: string;
  output_TransactionID: string;
  output_ConversationID: string;
  output_ThirdPartyReference: string;
}

const generate_bearer_token = (): string => {
  // Garantir que a chave pública tem os headers corretos
  const pk = `-----BEGIN PUBLIC KEY-----\n${env.MPESA_PUBLIC_KEY}\n-----END PUBLIC KEY-----`;
  const encrypted = crypto.publicEncrypt(
    { key: pk, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(env.MPESA_API_KEY)
  );
  return encrypted.toString('base64');
};

export const initiatePayment = async (
  request: MpesaPaymentRequest
): Promise<MpesaPaymentResponse> => {
  // No Sandbox, muitas vezes usamos o bearer_token diretamente no pagamento
  const token = generate_bearer_token();

  const payload = {
    input_Amount: request.amount.toString(),
    input_CustomerMSISDN: request.customer_msisdn,
    input_ServiceProviderCode: request.service_provider_code,
    input_ThirdPartyReference: request.third_party_reference,
    input_TransactionReference: request.transaction_reference,

    // adding data in grok
    input_ResultURL: 'https://footbath-subatomic-yodel.ngrok-free.dev',
    input_CallbackURL: '/api/v1/payments/callback'
  };

  const response = await fetch(
    `${env.MPESA_BASE_URL}/c2bPayment/singleStage/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'developer.mpesa.vm.co.mz',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json() as MpesaPaymentResponse;

  
  // ok as long its INS responSE
  if (data.output_ResponseCode !== 'INS-0' && data.output_ResponseCode !== 'INS-1') {
     throw new Error(`M-Pesa Error: ${data.output_ResponseCode} - ${data.output_ResponseDesc}`);
  }

  return data;
};