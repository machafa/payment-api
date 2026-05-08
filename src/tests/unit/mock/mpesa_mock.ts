/**
 * Mock de resposta de SUCESSO do Gateway M-Pesa (C2B)
 */
export const mockMpesaSuccess = {
  output_ResponseCode: 'INS-0',
  output_ResponseDesc: 'Request processed successfully',
  output_TransactionID: 'MOCK_TXN_123',
  output_ConversationID: 'MOCK_CONV_123',
  output_ThirdPartyReference: 'REF123',
};

/**
 * Mock de resposta de FALHA do Gateway M-Pesa
 */
export const mockMpesaFailure = {
  output_ResponseCode: 'INS-6',
  output_ResponseDesc: 'Transaction failed',
  output_TransactionID: '',
  output_ConversationID: '',
  output_ThirdPartyReference: 'REF123',
};

/**
 * Mock de resposta de DUPLICADO (Idempotência no Gateway)
 */
export const mockMpesaDuplicate = {
  output_ResponseCode: 'INS-10',
  output_ResponseDesc: 'Duplicate Transaction',
  output_TransactionID: '',
  output_ConversationID: '',
  output_ThirdPartyReference: 'REF123',
};

/**
 * Objeto de pagamento simulando o que está na tua Base de Dados
 */
export const mockPayment = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  amount: 100,
  currency: 'MZN',
  status: 'PENDING',
  method: 'MPESA',
  customer_msisdn: '258841234567',
  transaction_reference: 'T1234567',
  third_party_reference: 'REF123', // Deve bater com os mocks acima
  idempotency_key: 'test-key-001',
  mpesa_transaction_id: null,
  mpesa_conversation_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};