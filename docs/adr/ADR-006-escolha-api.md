# ADR-006 — Escolha do estilo de API: REST

**Data:** 08/05/2026  
**Status:** Aceite

## Contexto

O sistema expõe endpoints para processar pagamentos, consultar transacções, e receber webhooks de providers externos. É necessário definir o estilo arquitectural da API — a forma como os clientes comunicam com o sistema e como os recursos são expostos.

## Decisão

Adoptar **REST (Representational State Transfer)** como estilo arquitectural da API, com documentação via **OpenAPI 3.0 / Swagger**.

## Justificação

REST é o estilo mais amplamente suportado e compreendido para APIs de pagamentos. A API do M-Pesa é ela própria REST — manter o mesmo estilo reduz a fricção conceptual na integração. Os três endpoints obrigatórios do exercício — `POST /payments`, `GET /payments/{id}`, e `POST /webhooks/provider` — mapeiam naturalmente para recursos e verbos HTTP sem necessidade de abstracções adicionais.

O OpenAPI 3.0 é o standard da indústria para documentação de APIs REST, com suporte a geração automática de Swagger UI — um requisito explícito do exercício. Ferramentas como Postman, k6, e a maioria dos gateways de API consomem specs OpenAPI directamente, facilitando testes e integração.

## Alternativas consideradas

**GraphQL** — flexível para queries complexas e múltiplos clientes com necessidades diferentes. Rejeitado porque os endpoints deste sistema são simples e bem definidos — a flexibilidade do GraphQL introduz complexidade desnecessária num sistema de pagamentos onde as operações são fixas e previsíveis.

**gRPC** — excelente performance para comunicação interna entre microserviços. Rejeitado porque o sistema é um serviço único e os clientes externos — incluindo o M-Pesa — comunicam via HTTP/REST. gRPC requereria uma camada de tradução adicional.

**SOAP** — usado em sistemas bancários legados. Rejeitado por verbosidade e complexidade desnecessária num MVP moderno.

## Consequências

A API segue convenções REST standard — verbos HTTP semânticos, códigos de status correctos, e recursos nomeados de forma consistente. A spec OpenAPI é mantida como fonte de verdade da API e deve ser actualizada sempre que os endpoints mudam. Qualquer cliente que consuma HTTP pode integrar com o sistema sem dependências específicas.