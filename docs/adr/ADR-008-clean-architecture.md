# ADR-008 — Arquitectura em camadas: Clean Architecture

**Data:** 08/05/2026  
**Status:** Aceite

## Contexto

O sistema precisa de ser maintível, testável, e extensível. Num sistema de pagamentos, a lógica de negócio — validação, idempotência, gestão de estados — não deve estar acoplada a detalhes de infraestrutura como o framework HTTP, a base de dados, ou o provider de pagamentos. Se o provider mudar de M-Pesa para e-Mola, ou se a base de dados mudar de PostgreSQL para outro sistema, o impacto deve ser mínimo.

## Decisão

Adoptar uma **arquitectura em camadas** inspirada em Clean Architecture, com separação explícita entre Controller, Service, Repository, e Gateway.

## Justificação

**Controller** — responsável exclusivamente por receber pedidos HTTP, validar headers e body, e devolver respostas. Não contém lógica de negócio.

**Service** — contém toda a lógica de negócio — verificação de idempotência, orquestração do fluxo de pagamento, decisão de retry. Não sabe nada de HTTP nem de SQL.

**Repository** — responsável exclusivamente por queries SQL. Não contém lógica de negócio. Cada função corresponde a uma operação na base de dados.

**Gateway** — responsável pela comunicação com sistemas externos — M-Pesa. Encapsula a autenticação RSA, o formato do payload, e o retry. Se o provider mudar, só o gateway muda.

Esta separação segue a **regra da dependência** — as camadas internas não dependem das externas. O Service não importa Express. O Repository não importa o Gateway.

## Alternativas consideradas

**Arquitectura monolítica sem camadas** — simples de começar mas rapidamente difícil de testar e modificar. Num sistema de pagamentos onde a lógica de negócio é crítica, misturar HTTP e SQL com lógica de negócio é um risco.

**Microserviços** — cada camada como serviço independente. Rejeitado pela complexidade de infraestrutura desnecessária para o tamanho actual do sistema. A arquitectura em camadas dentro de um monólito oferece os mesmos benefícios de separação sem o overhead operacional.

## Consequências

O sistema é mais fácil de testar — o Service pode ser testado com mocks do Repository e do Gateway sem levantar um servidor HTTP ou uma base de dados. A separação torna o código mais fácil de ler e de modificar. O trade-off é mais ficheiros e mais código inicial — justificado pela maintibilidade a longo prazo.