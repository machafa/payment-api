---

# Payments - M-Pesa Integration

## Descrição do Projeto

A **Resync Payment API** é uma solução de backend de alto desempenho e missão crítica, desenvolvida para gerir o ciclo de vida de pagamentos integrados com o gateway **M-Pesa**. O sistema foi projetado sob os princípios da **Clean Architecture**, garantindo que a lógica de negócio financeira permaneça isolada de infraestruturas externas e instabilidades de rede.

Num contexto onde a conectividade pode ser intermitente, esta API destaca-se pela implementação rigorosa de **Idempotência** e estratégias de **Resiliência (Exponential Backoff)**, assegurando que nenhuma transação seja duplicada ou perdida.

---

###  Objetivos Principais

* **Segurança Transacional:** Garantia de integridade de dados através de persistência ACID no PostgreSQL.
* **Orquestração Moderna:** Deploy totalmente contentorizado em **Kubernetes (kind)** sobre instâncias **VPS (Wolke Host)**.
* **Automação de Infraestrutura:** Pipeline de CI/CD robusto que valida qualidade e automatiza o provisionamento via manifestos declarativos.
* **Observabilidade:** Pronta para monitorização em tempo real com logs estruturados e probes de saúde (Liveness/Readiness).

---

## Infraestrutura

### Docker

A imagem está disponível no Docker Hub:

```bash
docker pull machafa/payment-api:latest
```

Para correr localmente:

```bash
docker run -p 3000:3000 --env-file .env machafa/payment-api:latest
```

O repositório no Docker Hub fica em:
https://hub.docker.com/r/machafa/payment-api

### Kubernetes

Os manifests estão em `k8s/`:

```bash
# Deploy
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Verificar estado
kubectl get pods
kubectl get services

# Logs
kubectl logs deployment/payment-api
```

**Nota:** O deploy de demonstração foi realizado na Wolke Host via GitHub. Os manifests Kubernetes estão configurados para deploy num cluster real com `kubectl apply -f k8s/`.

### Webhook M-Pesa

O endpoint de webhook deve estar exposto numa porta entre `11000` e `19000` conforme especificado pela API Vodacom. O `service.yaml` expõe a porta `11000` para este efeito.

---

## CI/CD

O pipeline está dividido em dois workflows:

**`ci.yml`** — corre em cada push para `develop`:
1. Instala dependências
2. Build TypeScript
3. Linting
4. Testes unitários e integração
5. Build Docker

**`deploy.yml`** — corre após CI passar em `main`:
1. Build e push da imagem para Docker Hub com tag do SHA do commit
2. Deploy no cluster Kubernetes
3. Rollback automático em caso de falha

---

## Observabilidade

### Logs

Logs estruturados em JSON em cada pedido:

```json
{
  "timestamp": "2026-05-04T12:00:00Z",
  "method": "POST",
  "path": "/api/v1/payments",
  "status": 202,
  "duration_ms": 245,
  "ip": "::1"
}
```

### SLI/SLO

| Indicador | Objectivo |
|---|---|
| Latência P95 | < 500ms |
| Taxa de sucesso | > 99.9% |
| Disponibilidade | > 99.5% |

### Health Checks

O Kubernetes usa o endpoint `/api/v1/health` para liveness e readiness probes — reinicia automaticamente pods que não respondam.

### Testes de carga

```bash
k6 run tests/load/payment.k6.js
```

---

## Liderança Técnica

### Gestão de performance da equipa

- Definition of Done clara e aplicada consistentemente
- Code reviews obrigatórios antes de merge para `develop`
- Conventional Commits para rastreabilidade de mudanças
- ADRs documentam decisões técnicas com contexto e justificação

### Redução de dívida técnica

- SQL raw em vez de ORM — controlo total sobre queries críticas
- Separação clara entre camadas — controller, service, repository, gateway
- Testes automatizados garantem que refactoring não quebra comportamento existente
- Pipeline CI falha automaticamente se linting ou testes falharem

### Priorização entre negócio e engenharia

- Idempotência implementada ao nível da base de dados — zero risco de cobrança dupla
- Retry com exponential backoff — resiliência sem impacto na experiência do utilizador
- Status `PENDING` assíncrono — o utilizador recebe resposta imediata sem esperar pelo M-Pesa
- Health check público — monitorização sem expor dados sensíveis

---

## Development Guidelines

### Nomenclatura

| Tipo | Convenção | Exemplo |
|---|---|---|
| Ficheiros | `snake_case` | `payment_service.ts` |
| Classes | `PascalCase` | `MpesaGateway` |
| Variáveis e funções | `camelCase` ou `snake_case` | `createPayment` |
| Variáveis de ambiente | `SCREAMING_SNAKE_CASE` | `DATABASE_URL` |
| Pastas | `snake_case` | `payment_api/` |

### Correr testes

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Cobertura
npm run test:coverage
```

---

## Autoria

Desenvolvido por **Penélope Sydney Machafa** 