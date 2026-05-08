import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Payment API - M-Pesa Integration',
    version: '1.0.0',
    description: 'Sistema de pagamentos resiliente para em MPesa com foco em baixa conectividade e idempotência.',
    contact: {
      name: 'Penelope Machafa',
      email: 'penelopesydney80@gmail.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Ambiente de Desenvolvimento Local',
    },
    {
      url: 'https://payment-api.wolkehost.com/api/v1',
      description: 'Ambiente de Produção (Wolke Host)',
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insere a tua API Key para testar os endpoints protegidos.',
      },
    },
    schemas: {
      CreatePaymentRequest: {
        type: 'object',
        required: ['amount', 'currency', 'method', 'customer_msisdn', 'transaction_reference', 'third_party_reference'],
        properties: {
          amount: { type: 'number', example: 150.50 },
          currency: { type: 'string', example: 'MZN' },
          method: { type: 'string', enum: ['MPESA'], example: 'MPESA' },
          customer_msisdn: { type: 'string', example: '258841234567', description: 'Formato MSISDN Moçambique' },
          transaction_reference: { type: 'string', example: 'TXN_998877' },
          third_party_reference: { type: 'string', example: 'ORDER_456' },
        },
      },
      PaymentResponse: {
        type: 'object',
        properties: {
          payment_id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
          payment_status: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED'], example: 'PENDING' },
          amount: { type: 'number', example: 150.50 },
          currency: { type: 'string', example: 'MZN' },
          created_at: { type: 'string', format: 'date-time', example: '2026-05-08T17:45:00Z' },
        },
      },
      WebhookPayload: {
        type: 'object',
        required: ['output_ResponseCode', 'output_ThirdPartyReference'],
        properties: {
          output_ResponseCode: { type: 'string', example: 'INS-0', description: 'INS-0 = Sucesso' },
          output_ResponseDesc: { type: 'string', example: 'Request processed successfully' },
          output_TransactionID: { type: 'string', example: 'M98J123L7' },
          output_ThirdPartyReference: { type: 'string', example: 'ORDER_456' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Idempotency-Key missing' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Verificar status do sistema',
        tags: ['System'],
        responses: {
          200: {
            description: 'API operacional',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } }
          }
        }
      }
    },
    '/payments': {
      post: {
        summary: 'Iniciar pagamento M-Pesa',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'Idempotency-Key',
            in: 'header',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            example: '77c5b6b8-1c40-4f9e-9f8a-987654321000'
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePaymentRequest' },
              example: {
                amount: 150,
                currency: 'MT',
                method: 'MPESA',
                customer_msisdn: '258855872316',
                transaction_reference: 'TXN_TEST_01',
                third_party_reference: 'ORDER_TEST_01'
              }
            }
          }
        },
        responses: {
          202: { description: 'Pagamento Aceite', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentResponse' } } } },
          400: { description: 'Bad Request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/payments/{id}': {
      get: {
        summary: 'Consultar estado do pagamento',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentResponse' } } } },
          404: { description: 'Não encontrado' }
        }
      }
    },
    '/webhooks/provider': {
      post: {
        summary: 'Callback do M-Pesa (Webhook)',
        description: 'Endpoint para recepção de notificações da Vodacom/M-Pesa.',
        tags: ['Webhooks'],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WebhookPayload' },
              example: {
                output_ResponseCode: "INS-0",
                output_ResponseDesc: "Success",
                output_TransactionID: "MPK12345",
                output_ThirdPartyReference: "ORDER_TEST_01"
              }
            }
          }
        },
        responses: {
          200: { description: 'Recebido' }
        }
      }
    }
  }
};

export const setupSwagger = (app: Express): void => {
  // Rota para documentação UI
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  // Rota para o JSON puro (útil para ferramentas de validação no CI/CD)
  app.get('/api/v1/swagger.json', (req, res) => {
    res.json(swaggerDocument);
  });

  console.log('Swagger funcional em: http://localhost:3000/api/v1/docs');
};

export default swaggerDocument;