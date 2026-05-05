# ADR-001-Escolha da stack tecnologica

**Data:** 04/05/2026
**Status:** Aceite

## Contexto

O sistema de pagamentos requer uma stack que permita entrega rápida de uma MVP funcional num prazo de uma semana, sem comprometer a qualidade do código, a segurança das transações, ou capacidade de escalar futuramente. O sistema opera no contexto Moçambicano, onde a baica conectividade e a integração com providers locais como M-Pesa e e-Mola são requisitos centrais.

## Decisão 

Adoptar **Node.js com TypeScript** como linguagem e runtime, **Express** como framework HTTP, e **pag (node-postgres)** como driver de base de dados.

## Justificação

**Node.js + Typescript** oferece tipagem estática que reduz erros em runtime, crítico num sistema financeiro onde um tipo errado pode significar um valor errado numa transação. O ecossistema é maduro, bem documentado, e familiar à equipa, permitindo foco na lógica de negócio em vez de na linguagem.

**Express** é minimalista, não impõe estrutura e é adequado para um sistema onde a arquitetura é definida explicitamente pela equipa e não pelo framework. Tem suporte nativo para middleware de logging, autenticação e tratamento de erros, todos necessários neste sistema.

**pg (node-postgres)** foi escolhido deliberadamente para manter controlo total sobre as queries SQL. SQL raw é também mais auditável, cada query é explicita e previsível.


## Alternativas consideradas

**Go (Golang)** - excelente performance e ideal para microserviços. Rejeitado pelo: a curva de aprendizagem no contexto de entrega numa semana introduziria risco desnecessário.

**Java + Spring Boot** - padrão enterprise para sistemas bancários, com bibliotecas maduras para segurança e persistência. Rejeitado pelo tempo de desenvolvimento mais lento e pelo overhead de configuração inicial do Spring.

**ORM (Prisma)** - aceleraria o desenvolvimento inicial mas introduziria abstracção sobre queries críticas e dificultaria optimização futura em cenários de alta carga.

## Consequências
O sistema ganha velociadade de desevolvimento e clareza de código. Em contrapartida, a gestão de migrações SQL e a escrita de queries são responsabilidade explícita da equipa. Numa fase de escala, esta decisão facilita a migração para um query builder como Knex.js ou para stored procedures sem necessidade de remover um ORM.