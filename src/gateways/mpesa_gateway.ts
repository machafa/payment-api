import crypto from 'crypto';
import { env } from '../config/env.js';

interface MpesaPaymentRequest {
  amount: number;
  customer_msisdn: string;
  service_provider_code: string;
  transaction_reference: string;
  third_party_reference: string;
}

interface MpesaPaymentResponse {
  output_response_code: string;
  output_response_desc: string;
  output_transaction_id: string;
  output_conversation_id: string;
  output__third_party_reference: string;
}

// Cache do session token
let cached_token: string | null = null;
let token_expiry: number | null = null;

const generate_bearer_token = (): string => {
  const pk = `-----BEGIN PUBLIC KEY-----\n${env.MPESA_PUBLIC_KEY}\n-----END PUBLIC KEY-----`;
  const encrypted = crypto.publicEncrypt(
    { key: pk, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(env.MPESA_API_KEY)
  );
  return encrypted.toString('base64');
};

const get_session_token = async (): Promise<string> => {
  // Retorna token em cache se ainda válido
  if (cached_token && token_expiry && Date.now() < token_expiry) {
    return cached_token;
  }

  const bearer_token = generate_bearer_token();

  const response = await fetch(
    `${env.MPESA_BASE_URL}/getSession/`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearer_token}`,
        'Origin': 'developer.mpesa.vm.co.mz',
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json() as { output_SessionID: string };

  if (!data.output_SessionID) {
    throw new Error('Failed to get M-Pesa session token');
  }

  // Cache por 25 minutos (token expira em 30)
  cached_token = data.output_SessionID;
  token_expiry = Date.now() + 25 * 60 * 1000;

  return cached_token;
};

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const with_retry = async <T>(
  fn: () => Promise<T>,
  max_attempts: number = 3
): Promise<T> => {
  let last_error: Error | null = null;

  for (let attempt = 1; attempt <= max_attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      last_error = error as Error;
      console.error(`Tentativa ${attempt} falhou:`, last_error.message);

      if (attempt < max_attempts) {
        // Exponential backoff com jitter
        const base_delay = Math.pow(2, attempt - 1) * 1000;
        const jitter = Math.random() * 500;
        const delay = base_delay + jitter;

        console.log(`A aguardar ${Math.round(delay)}ms antes da próxima tentativa...`);
        await sleep(delay);
      }
    }
  }

  throw last_error;
};

export const initiatePayment = async (
  request: MpesaPaymentRequest
): Promise<MpesaPaymentResponse> => {
  return with_retry(async () => {
    const session_token = await get_session_token();

    const payload = {
      input_Amount: request.amount.toString(),
      input_Country: 'MOZ',
      input_Currency: 'MZN',
      input_CustomerMSISDN: request.customer_msisdn,
      input_ServiceProviderCode: request.service_provider_code,
      input_ThirdPartyConversationID: request.third_party_reference,
      input_TransactionReference: request.transaction_reference,
      input_PurchasedItemsDesc: 'Pagamento',
    };

    const response = await fetch(
      `${env.MPESA_BASE_URL}/c2bPayment/singleStage/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session_token}`,
          'Origin': 'developer.mpesa.vm.co.mz',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`M-Pesa API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as MpesaPaymentResponse;

    if (data.output_response_code !== 'INS-0') {
      throw new Error(`M-Pesa payment failed: ${data.output_response_desc}`);
    }

    return data;
  });
};
