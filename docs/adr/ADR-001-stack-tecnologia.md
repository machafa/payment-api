# ADR-001 — Escolha da stack tecnológica

**Data:** 08/05/2026  
**Status:** Aceite

## Contexto

O sistema de pagamentos requer uma stack que permita entrega rápida de um MVP funcional num prazo de uma semana, sem comprometer a qualidade do código, a segurança das transacções, ou a capacidade de escalar futuramente. O sistema opera no contexto de Moçambique, onde a baixa conectividade e a integração com providers locais como M-Pesa e e-Mola são requisitos centrais.

## Decisão

Adoptar **Node.js com TypeScript** como linguagem e runtime, **Express** como framework HTTP, e **pg (node-postgres)** como driver de base de dados.

## Justificação

**Node.js + TypeScript** oferece tipagem estática que reduz erros em runtime — crítico num sistema financeiro onde um tipo errado pode significar um valor errado numa transacção. O ecossistema é maduro, bem documentado, e familiar à equipa, permitindo foco na lógica de negócio em vez de na linguagem.

**Express** é minimalista e não impõe estrutura — adequado para um sistema onde a arquitectura é definida explicitamente pela equipa e não pelo framework. Tem suporte nativo para middleware de logging, autenticação, e tratamento de erros, todos necessários neste sistema.

**pg (node-postgres)** em vez de um ORM foi escolhido deliberadamente para manter controlo total sobre as queries SQL. Num sistema de pagamentos com potencial de alto volume de transacções, a abstracção de um ORM introduz overhead desnecessário e dificulta a optimização de queries críticas. SQL raw é também mais auditável — cada query é explícita e previsível.

## Alternativas consideradas

**Go (Golang)** — excelente performance e ideal para microserviços. Rejeitado pelo prazo: a curva de aprendizagem no contexto de entrega em uma semana introduziria risco desnecessário.

**Java + Spring Boot** — padrão enterprise para sistemas bancários, com bibliotecas maduras para segurança e persistência. Rejeitado pelo tempo de desenvolvimento mais lento e pelo overhead de configuração inicial do Spring.

**ORM (Prisma / TypeORM)** — aceleraria o desenvolvimento inicial mas introduziria abstracção sobre queries críticas e dificultaria optimização futura em cenários de alta carga.

## Consequências

O sistema ganha velocidade de desenvolvimento e clareza de código. Em contrapartida, a gestão de migrações SQL e a escrita de queries são responsabilidade explícita da equipa. Numa fase de escala, esta decisão facilita a migração para um query builder como Knex.js ou para stored procedures sem necessidade de remover um ORM.