# payment-api

## Development Guidelines

### Nomenclatura de ficheiros
- Ficheiros TypeScript: `kebab-case` → `payment.service.ts`
- Classes: `PascalCase` → `MpesaGateway`
- Variáveis e funções: `camelCase` → `createPayment`
- Variáveis de ambiente: `SCREAMING_SNAKE_CASE` → `DATABASE_URL`
- Pastas: `kebab-case` → `payment-api/`

### Commits
Seguimos Conventional Commits:
- `feat` — nova funcionalidade
- `fix` — correcção de bug
- `docs` — documentação
- `chore` — setup e manutenção
- `ci` — pipeline CI/CD
- `test` — testes
- `refactor` — refactoring

## Branching Strategy

| Branch | Uso |
|---|---|
| `main` | produção — código estável e deployado |
| `develop` | integração — features prontas para teste |
| `feat/{nome-da-feature}` | nova funcionalidade |
| `fix/{nome-do-bug}` | correcção de bug |

### Regras
- Nunca commitar directamente para `main`
- `feat/` e `fix/` saem sempre de `develop`
- Merge para `develop` requer pull request e code review
- Merge para `main` requer pipeline CI a passar