# ADR-004 — Estratégia de resiliência e retry

**Data:** 04/05/2026  
**Status:** Aceite

## Contexto

O sistema opera em Moçambique, onde a conectividade é instável. Chamadas à API do M-Pesa podem falhar por timeout, indisponibilidade temporária do provider, ou perda de pacotes. Sem uma estratégia de retry, falhas de rede resultam em pagamentos perdidos ou incompletos.

## Decisão

Implementar **exponential backoff com jitter** para todas as chamadas ao provider externo, com um máximo de 3 tentativas antes de marcar o pagamento como `FAILED`.

## Justificação

**Exponential backoff** — cada tentativa espera o dobro do tempo da anterior. Isto evita sobrecarregar o provider quando este está com problemas, ao contrário de retries imediatos que podem agravar a situação.

**Jitter** — adiciona uma variação aleatória ao tempo de espera. Se múltiplos pedidos falharem ao mesmo tempo e todos tentarem de novo ao mesmo instante, cria-se um pico de tráfego. O jitter distribui as tentativas no tempo.

**Máximo de 3 tentativas** — um número razoável para absorver falhas temporárias sem manter o utilizador à espera indefinidamente. Após 3 falhas, o pagamento é marcado como `FAILED` e o utilizador é notificado para tentar de novo.

**Idempotency key** — garante que retries nunca criam pagamentos duplicados, mesmo que o pedido chegue ao M-Pesa mais do que uma vez.

O intervalo de espera segue esta lógica:

```
tentativa 1 → espera 1s + jitter
tentativa 2 → espera 2s + jitter
tentativa 3 → espera 4s + jitter
→ FAILED
```

## Alternativas consideradas

**Retry imediato** — rejeitado. Em contexto de baixa conectividade, retries imediatos sobrecarregam o provider e não dão tempo para a rede recuperar.

**Fila de mensagens (RabbitMQ)** — mais robusto para retry assíncrono, mas adiciona complexidade de infraestrutura. Considerado como evolução futura após o MVP.

**Circuit breaker** — padrão complementar ao retry que interrompe chamadas quando o provider está claramente indisponível. Considerado como melhoria futura.

## Consequências

O sistema tolera falhas temporárias de rede sem intervenção manual. Em caso de falha persistente, o pagamento fica com status `FAILED` e pode ser reprocessado manualmente ou pelo utilizador. A combinação de retry com idempotency key garante que não existem cobranças duplicadas independentemente do número de tentativas.