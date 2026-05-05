# ADR-002 - Escolha da base de dados: PostgreSQL

**Data:** 04/05/2026
**Status:** Aceite

## Contexto

O sistema de pagamentos requer persistência de dados com garantias fortes de consistência. Cada transacção financeira deve ser completada integralmente ou revertida, não existindo estado intermédio aceitável. O sistema opera em contexto de baixa conectividade, onde falhas a meio de uma operação são frequentes.

## Decisão

Adoptar **PostgreSQL** como base de dados principal.

## Justificação

PostgreSQL suporta propriedades **ACID** na totalidade (*A*tomicidade, *C*onsistência, *I*solamento e *D*urabilidade). Num sistema de pagamentos isto é não negociável: se o servidor cair a meio de uma transferência, a transacção é revertida automaticamente. O dinheiro não desaparece nem é debitado sem ser creditado.

Suporta também **transacções explícitas**, o que permite agrupar múltiplas operações — por exemplo, criar o pagamento e registar o log de auditoria — numa única operação atómica. Ou tudo acontece, ou nada acontece.

A coluna `idempotency_key` com constraint `UNIQUE` é implementada directamente no PostgreSQL, garantindo que duplicados são rejeitados ao nível da base de dados — não apenas ao nível da aplicação, onde um bug poderia falhar silenciosamente.

É open source, amplamente suportado em ambientes Kubernetes, e compatível com a Wolke Host onde o sistema será deployado.

## Alternativas consideradas

**MySQL** — suporte ACID adequado mas ecossistema menos rico para casos de uso financeiros. Sem vantagem clara sobre PostgreSQL neste contexto.

**MongoDB ou outro NoSQL** — rejeitado. Bases de dados de documentos não oferecem transacções ACID com o mesmo nível de maturidade. Num sistema financeiro, a flexibilidade de schema do NoSQL não compensa a perda de garantias transaccionais.

**SQLite** — adequado para desenvolvimento local mas sem suporte a concorrência de múltiplas conexões em produção. Inaceitável para um sistema de pagamentos.

## Consequências

O sistema ganha garantias fortes de consistência e integridade dos dados. O schema é rígido, o que exige migrações explícitas quando a estrutura muda — mas num sistema financeiro esta rigidez é uma vantagem, não uma limitação, porque força decisões conscientes sobre a estrutura dos dados.