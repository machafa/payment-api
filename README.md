# Payment API

Sistema de pagamentos resiliente para Moçambique, com suporte a M-Pesa, desenhado para funcionar em ambientes de baixa conectividade.

## Stack

- **Runtime:** Node.js com TypeScript
- **Framework:** Express
- **Base de dados:** PostgreSQL (Render)
- **Deploy:** Docker no Render
- **Testes:** Jest com ts-jest

---

## Pré-requisitos

- Node.js >= 18
- Docker
- PostgreSQL (local ou Render)
- Conta no portal M-Pesa Developer

---

## Instalação Local

```bash
# 1. Clonar o repositório
git clone https://github.com/machafa/payment-api.git
cd payment-api

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edita o .env com as tuas credenciais

# 4. Correr as migrações
npx prisma migrate dev

# 5. Iniciar o servidor
npm run dev
```

---

## Variáveis de Ambiente

Cria um ficheiro `.env` na raiz com as seguintes variáveis:

```dotenv
PORT=3000
NODE_ENV=development

# Base de dados
DATABASE_URL=postgresql://user:password@localhost:5432/payment_db

# M-Pesa
MPESA_API_KEY=tua_api_key
MPESA_PUBLIC_KEY=tua_public_key
MPESA_BASE_URL=https://openapi.m-pesa.com/sandbox/ipg/v2/vodacomMOZ
MPESA_SERVICE_PROVIDER_CODE=171717
```

> Nunca commites o `.env` para o repositório. Confirma que está no `.gitignore`.

---

## Endpoints

### POST /payments

Inicia um pagamento via M-Pesa.

**Body:**
```json
{
  "amount": 100,
  "currency": "MZN",
  "method": "MPESA",
  "customer_msisdn": "258841234567",
  "transaction_reference": "T1234567",
  "third_party_reference": "REF123",
  "idempotency_key": "chave-unica-001"
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "status": "PENDING",
  "amount": 100,
  "currency": "MZN",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

### GET /payments/:id

Retorna os detalhes de um pagamento pelo ID.

**Resposta:**
```json
{
  "id": "uuid",
  "status": "SUCCESS",
  "amount": 100,
  "currency": "MZN",
  "customer_msisdn": "258841234567",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:10Z"
}
```

---

### POST /webhooks/provider

Recebe notificações do provider de pagamento (M-Pesa) e actualiza o estado do pagamento.

**Body (enviado pelo provider):**
```json
{
  "output_TransactionID": "ABC123",
  "output_ResponseCode": "INS-0",
  "output_ResponseDesc": "Request processed successfully",
  "output_ThirdPartyConversationID": "REF123"
}
```

---

## Idempotência

Todos os pedidos `POST /payments` requerem um `idempotency_key` único. Se um pedido com a mesma chave for enviado mais de uma vez, o sistema retorna o pagamento original sem criar um duplicado. Isto protege contra retries em ambientes de baixa conectividade.

---

## Resiliência

O sistema foi desenhado para funcionar em ambientes de baixa conectividade:

- **Retry automático** — pedidos falhados ao M-Pesa são re-tentados com backoff exponencial
- **Idempotência** — garante que retries não criam pagamentos duplicados
- **Timeout configurável** — conexões com timeout de 10 segundos para evitar bloqueios
- **Estado persistente** — todos os pagamentos são persistidos em PostgreSQL antes de chamar o provider

---

## Testes

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Todos os testes
npm test
```

Os testes unitários usam mocks para o repositório e para o gateway M-Pesa. Os testes de integração requerem uma base de dados PostgreSQL acessível.

Para testes, cria um ficheiro `.env.test`:

```dotenv
NODE_ENV=test
DATABASE_URL=postgres://user:pass@localhost:5432/test_db
API_KEY=test_key
MPESA_API_KEY=test_key
MPESA_PUBLIC_KEY=test_public_key
MPESA_BASE_URL=https://mock.mpesa.com
MPESA_SERVICE_PROVIDER_CODE=171717
```

---

## Deploy com Docker

```bash
# Build da imagem
docker build -t payment-api .

# Correr o container
docker run -p 3000:3000 --env-file .env payment-api
```

O deploy é feito automaticamente no Render a cada push para a branch `main` via CI/CD.

---

## CI/CD

O pipeline de CI/CD corre automaticamente no GitHub Actions:

1. Linting e validação de tipos TypeScript
2. Testes unitários
3. Testes de integração
4. Build do container Docker
5. Deploy no Render (apenas na branch `main`)

O pipeline falha automaticamente se qualquer passo falhar.

---

## Estrutura do Projecto

```
src/
├── config/
│   ├── database.ts       # Configuração do pool PostgreSQL
│   └── env.ts            # Validação de variáveis de ambiente
├── modules/
│   └── payments/
│       ├── payment_service.ts      # Lógica de negócio
│       ├── payment_repository.ts   # Acesso à base de dados
│       └── payment_controller.ts   # Handlers HTTP
├── gateways/
│   └── mpesa_gateway.ts  # Integração com M-Pesa
├── tests/
│   ├── unit/             # Testes unitários
│   ├── integration/      # Testes de integração
│   └── setup.ts          # Configuração de variáveis para testes
└── app.ts                # Entry point
```

---

## Segurança

- Variáveis sensíveis (API keys, passwords) nunca são committed no repositório
- Em produção, as variáveis são injectadas via Render Environment Variables ou Kubernetes Secrets
- SSL obrigatório em produção para conexões à base de dados
- Validação de input em todos os endpoints

---

## Contacto

Para questões técnicas, abre uma issue no repositório.
