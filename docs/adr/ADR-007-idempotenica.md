# ADR-007 — Estratégia de idempotência

**Data:** 08/05/2026  
**Status:** Aceite

## Contexto

O sistema opera em Moçambique, onde a conectividade é instável. Quando um cliente envia um pedido de pagamento e a rede cai antes de receber a resposta, não sabe se o pagamento foi processado ou não. Se tentar de novo, corre o risco de ser cobrado duas vezes. Este é um problema crítico num sistema financeiro — uma cobrança duplicada causa prejuízo directo ao utilizador e danos à reputação do sistema.

## Decisão

Implementar idempotência via **`Idempotency-Key`** no header HTTP, com verificação ao nível da aplicação e constraint `UNIQUE` na base de dados como segunda linha de defesa.

## Justificação

**Header `Idempotency-Key`** — o cliente gera um UUID único antes de enviar o pedido e inclui-o no header. Se precisar de tentar de novo, usa o mesmo UUID. O servidor verifica se já existe um pagamento com aquela chave — se sim, retorna o resultado original sem processar de novo.

**Verificação dupla** — a verificação acontece em dois níveis:

1. **Aplicação** — o service verifica `findByIdempotencyKey` antes de criar o pagamento
2. **Base de dados** — a coluna `idempotency_key` tem constraint `UNIQUE`, rejeitando duplicados mesmo em condições de race condition

A dupla verificação é intencional — um bug na aplicação não consegue contornar a constraint da base de dados.

**Responsabilidade do cliente** — o cliente é responsável por gerar e guardar a chave. Para uma nova operação, gera um novo UUID. Para repetir uma operação falhada, usa a mesma chave.

## Alternativas consideradas

**Idempotência apenas na aplicação** — rejeitado. Em condições de race condition — dois pedidos simultâneos com a mesma chave — a verificação na aplicação pode falhar. A constraint na base de dados é a única garantia absoluta.

**Idempotência apenas na base de dados** — possível, mas sem verificação na aplicação o sistema faz trabalho desnecessário antes de receber o erro da DB. A verificação na aplicação é mais eficiente.

**Transaction reference como chave de idempotência** — rejeitado. A `transaction_reference` é definida pelo cliente e pode colidir. A `idempotency_key` é um UUID gerado especificamente para cada tentativa.

## Consequências

O sistema garante que um pagamento nunca é processado duas vezes independentemente de falhas de rede ou retries do cliente. O cliente deve implementar a lógica de geração e reutilização de chaves — isto é documentado no Swagger e no README. Em produção, as chaves podem ser expiradas após um período definido para libertar espaço na base de dados.