# ADR-005 — Estratégia de autenticação da API

**Data:** 08/05/2026  
**Status:** Aceite

## Contexto

O sistema expõe endpoints REST que processam pagamentos reais. Qualquer chamada não autenticada a `POST /payments` representa um risco financeiro e de segurança directos. É necessária uma estratégia de autenticação que seja simples de implementar no prazo disponível, segura para um MVP, e extensível para versões futuras.

## Decisão

Adoptar **API Keys** estáticas transmitidas via header `Authorization: Bearer <api-key>` como mecanismo de autenticação para os endpoints da API.

## Justificação

Para um MVP de sistema de pagamentos com integrações machine-to-machine — onde é uma aplicação a chamar a API, não um utilizador humano — API Keys são o mecanismo mais directo e adequado. Não introduzem overhead de sessões, refresh tokens, ou fluxos de autorização complexos.

A chave é transmitida via header HTTPS, garantindo que nunca viaja em texto claro. É validada em middleware antes de qualquer lógica de negócio ser executada, o que centraliza a autenticação num único ponto auditável.

As API Keys são armazenadas como variáveis de ambiente e nunca hardcoded no código — seguindo o princípio de separação de configuração e código.

## Alternativas consideradas

**JWT (JSON Web Tokens)** — adequado para autenticação de utilizadores com sessões e permissões granulares. Rejeitado para este MVP por introduzir complexidade desnecessária num contexto machine-to-machine sem gestão de utilizadores.

**OAuth2** — padrão robusto para autorização delegada. Rejeitado pela complexidade de implementação no prazo disponível. Considerado como evolução futura quando o sistema tiver múltiplos clientes com permissões distintas.

**Sem autenticação** — inaceitável num sistema financeiro independentemente do ambiente.

## Consequências

A API fica protegida contra chamadas não autorizadas com implementação mínima. A limitação desta abordagem é que todas as API Keys têm o mesmo nível de acesso — não existe granularidade de permissões. Em produção real, esta decisão deve ser revisitada em favor de OAuth2 com scopes definidos por cliente.