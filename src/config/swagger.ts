import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Payment API',
    version: '1.0.0',
    description: 'Sistema de pagamentos resiliente para Moçambique com integração M-Pesa',
    contact: {
      name: 'Fadzai Machafa',
      email: 'fadzai@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Desenvolvimento local',
    },
    {
      url: 'https://payment-api.wolkehost.com/api/v1',
      description: 'Produção',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'API Key no formato Bearer <api-key>',
      },
    },
    schemas: {
      CreatePaymentRequest: {
        type: 'object',
        required: [
          'amount',
          'currency',
          'method',
          'customer_msisdn',
          'transaction_reference',
          'third_party_reference',
        ],
        properties: {
          amount: {
            type: 'number',
            example: 100.00,
            description: 'Valor do pagamento',
          },
          currency: {
            type: 'string',
            example: 'MZN',
            description: 'Código da moeda',
          },
          method: {
            type: 'string',
            enum: ['MPESA'],
            example: 'MPESA',
            description: 'Método de pagamento',
          },
          customer_msisdn: {
            type: 'string',
            example: '258841234567',
            description: 'Número de telefone do cliente',
          },
          transaction_reference: {
            type: 'string',
            example: 'T1234567',
            description: 'Referência única da transacção',
          },
          third_party_reference: {
            type: 'string',
            example: 'REF123',
            description: 'Referência do sistema externo',
          },
        },
      },
      PaymentResponse: {
        type: 'object',
        properties: {
          payment_id: {
            type: 'string',
            format: 'uuid',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
          payment_status: {
            type: 'string',
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
            example: 'PENDING',
          },
          amount: {
            type: 'number',
            example: 100.00,
          },
          currency: {
            type: 'string',
            example: 'MZN',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-04T12:00:00Z',
          },
        },
      },
      WebhookPayload: {
        type: 'object',
        required: [
          'output_ResponseCode',
          'output_ThirdPartyReference',
        ],
        properties: {
          output_ResponseCode: {
            type: 'string',
            example: 'INS-0',
            description: 'Código de resposta do M-Pesa. INS-0 indica sucesso.',
          },
          output_ResponseDesc: {
            type: 'string',
            example: 'Request processed successfully',
          },
          output_TransactionID: {
            type: 'string',
            example: 'ABC123456789',
          },
          output_ConversationID: {
            type: 'string',
            example: 'CONV123456',
          },
          output_ThirdPartyReference: {
            type: 'string',
            example: 'REF123',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Payment not found',
          },
          path: {
            type: 'string',
            example: '/api/v1/payments/123',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Verifica se o servidor está a funcionar',
        tags: ['System'],
        responses: {
          200: {
            description: 'Servidor online',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/payments': {
      post: {
        summary: 'Criar pagamento',
        description: 'Inicia um novo pagamento via M-Pesa. Retorna imediatamente com status PENDING. O resultado final chega via webhook.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'Idempotency-Key',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Chave única para evitar pagamentos duplicados',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePaymentRequest' },
            },
          },
        },
        responses: {
          202: {
            description: 'Pagamento iniciado — aguarda confirmação do cliente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaymentResponse' },
              },
            },
          },
          400: {
            description: 'Dados inválidos ou Idempotency-Key em falta',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Não autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/payments/{id}': {
      get: {
        summary: 'Consultar pagamento',
        description: 'Retorna os detalhes de um pagamento pelo ID',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'ID único do pagamento',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
        ],
        responses: {
          200: {
            description: 'Pagamento encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaymentResponse' },
              },
            },
          },
          404: {
            description: 'Pagamento não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Não autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/webhooks/provider': {
      post: {
        summary: 'Webhook M-Pesa',
        description: 'Endpoint chamado pelo M-Pesa para notificar o resultado de um pagamento. Não requer autenticação — é chamado directamente pela Vodacom.',
        tags: ['Webhooks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WebhookPayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Webhook processado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Webhook processed successfully' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Payload inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Swagger disponível em /api/v1/docs');
};

export default swaggerDocument;