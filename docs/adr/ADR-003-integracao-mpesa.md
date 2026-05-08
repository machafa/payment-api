# ADR-003 — Integração com provider de pagamentos externo (M-Pesa)

**Data:** 04/05/2026  
**Status:** Aceite

## Contexto

O sistema necessita de integrar com a API REST da Vodacom M-Pesa Moçambique para processar pagamentos Customer-to-Business (C2B). A documentação oficial do portal de developer da Vodacom especifica um mecanismo de autenticação próprio baseado em RSA e Base64, diferente do OAuth2 convencional. O sandbox está disponível em `api.sandbox.vm.co.mz` e requer autenticação em todos os pedidos. O sistema opera em contexto de baixa conectividade, onde chamadas à API externa podem falhar ou ter latência elevada.

Análise de implementações de referência existentes — nomeadamente o SDK não oficial `emagombe/mpesa-api` para PHP — confirmou os parâmetros reais da API, o formato de resposta, e os códigos de resultado, complementando a documentação oficial.

## Decisão

Implementar uma classe `MpesaGateway` dedicada em TypeScript que encapsula toda a lógica de comunicação com a API M-Pesa, incluindo encriptação RSA da API Key, geração do Bearer Token, e lógica de retry com exponential backoff. Não será usado nenhum SDK externo.

## Justificação

**Encriptação RSA própria** — a API M-Pesa não usa OAuth2. O mecanismo real consiste em encriptar a API Key com uma Public Key RSA de 4096 bits fornecida pela Vodacom, codificar o resultado em Base64, e enviar no header `Authorization: Bearer <resultado>`. Implementado com o módulo nativo `crypto` do Node.js, sem dependências externas.

**Sem SDK externo** — a própria documentação da Vodacom sugere implementação directa para developers experientes. Não existe SDK oficial mantido para Node.js no contexto da API Moçambique. Implementação directa é mais controlável, auditável, e sem dependências de terceiros num sistema financeiro.

**Encapsulamento no MpesaGateway** — isola o resto do sistema de detalhes específicos do M-Pesa. Se o provider mudar ou a API evoluir, apenas o gateway é afectado.

**Modo assíncrono via webhook** — o resultado de um pagamento não é imediato. O endpoint `POST /webhooks/provider` recebe a confirmação final da Vodacom. Este endpoint deve ser público, acessível via HTTPS, e exposto numa porta entre 11000 e 19000 conforme especificado pela documentação oficial.

## Parâmetros da API C2B

**Request:**
```json
{
  "input_Amount": "10",
  "input_Country": "MOZ",
  "input_Currency": "MZN",
  "input_CustomerMSISDN": "258840000000",
  "input_ServiceProviderCode": "171717",
  "input_ThirdPartyConversationID": "REF123",
  "input_TransactionReference": "T1234",
  "input_PurchasedItemsDesc": "Pagamento"
}
```

**Response de sucesso:**
```json
{
  "output_ResponseCode": "INS-0",
  "output_ResponseDesc": "Request processed successfully",
  "output_TransactionID": "...",
  "output_ConversationID": "...",
  "output_ThirdPartyReference": "REF123"
}
```

**Código de sucesso:** `INS-0` — qualquer outro código indica erro ou estado pendente.

## Alternativas consideradas

**OAuth2** — incorrectamente assumido como mecanismo de autenticação do M-Pesa antes da consulta da documentação oficial. A API Vodacom Moçambique usa RSA+Base64, não OAuth2.

**SDK `emagombe/mpesa-api` (PHP)** — útil como referência para confirmar parâmetros e lógica de encriptação, mas não utilizável directamente por ser PHP. A lógica foi portada para TypeScript com o módulo nativo `crypto`.

**Axios como cliente HTTP** — válido, mas `fetch` nativo do Node.js 18+ elimina uma dependência externa desnecessária num sistema financeiro.

## Consequências

O sistema depende da disponibilidade do sandbox `api.sandbox.vm.co.mz` para testes de integração. Em produção, requer credenciais reais obtidas junto da Vodacom. A configuração de porta específica para o webhook (11000–19000) tem impacto directo no manifesto Kubernetes — o Service e o Ingress devem expor o endpoint nessa gama de portas.