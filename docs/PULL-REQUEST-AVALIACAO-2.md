# Pull Request — Avaliacao 2

Use este conteudo na descricao do PR da Avaliacao 2.

---

## Diagnostico

### Estado apos a Avaliacao 1

A A1 reorganizou a codebase em estrutura feature-based (controller → service → repository), introduziu `ApiError`, testes unitarios em utils (22 testes), ESLint/Prettier e Lefthook.

### Problemas identificados para a Avaliacao 2

- Validacao manual nos services — DTOs sem garantia em runtime
- Senhas expostas em `GET /api/users`
- Testes apenas em funcoes puras (`utils/`), sem cobrir regras de negocio
- Instanciacao acoplada nas rotas
- Ausencia de Docker e pipeline CI
- Erros de typecheck em rotas de tickets

---

## Mudancas realizadas

### Organizacao arquitetural

- Controllers finos; validacao na borda HTTP via middleware
- Factory de composicao (`create-tickets-module`, `create-users-module`)
- `createApp()` separado de `server.ts` para testabilidade

### Design patterns

- **Middleware** — `validateBody`, `validateListTicketsQuery` em `validate-request.ts`
- **Factory** — modulos em `src/composition/`
- **Repository** — contrato documentado vs implementacao JSON

### Validacao

- Schemas Zod nos DTOs de tickets
- `fromZodError` + `parseOrThrow` para erros consistentes
- Regras de negocio permanecem no service (requester valido, fechar com comentario)

### Testes

- 8 testes unitarios do `TicketsService` (mocks de repository)
- 4 testes de integracao HTTP com supertest
- Total: **22 → 37 testes**

### Seguranca

- `PublicUser` / `toPublicUser` — `GET /users` e tickets enriquecidos sem campo `password`

### Docker

- `Dockerfile` multi-stage com seed no build
- `docker-compose.yml` com volume `./data`
- HEALTHCHECK em `/api/health`

### CI

- GitHub Actions: lint, typecheck, test, build

### README

- Quick start, Docker, CI, estrutura do projeto, secao "Como avaliar"

---

## Conceitos aplicados

| Conceito               | Como foi aplicado                       |
| ---------------------- | --------------------------------------- |
| Design patterns        | Middleware, Factory, Repository         |
| Organizacao em camadas | HTTP / negocio / infra separados        |
| Testes automatizados   | Unit (service) + integracao (supertest) |
| Validacao de entrada   | Zod nos DTOs + middleware               |
| Tratamento de erros    | ApiError + fromZodError + routeHandler  |
| Seguranca basica       | DTO publico sem senha                   |
| Docker                 | Dockerfile + compose                    |
| CI                     | GitHub Actions workflow                 |

---

## Evidencias de funcionamento

### Comandos executados

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Resultados

- [x] Lint sem erros
- [x] Testes passando (37)
- [x] Build sem erros
- [ ] Docker — validar localmente com `docker compose up --build`
- [ ] Pipeline CI verde apos push

### Validacao manual

Ver [docs/VALIDACAO-MANUAL-A2.md](docs/VALIDACAO-MANUAL-A2.md).

- [x] Criar ticket com dados validos → 201
- [x] Criar ticket com dados invalidos → 400
- [x] GET /users sem campo password
- [x] Fechar ticket sem comentario → 400

---

## Continuidade com a Avaliacao 1

Este PR evolui a estrutura feature-based da A1 sem reescrever a aplicacao. Mantidos controllers/services/repositories, ApiError e testes de utils. Adicionadas validacao Zod, patterns explicitos, testes de service/integracao, Docker e CI.

---

## Limitacoes conhecidas

- Persistencia sincrona em JSON (nao alterada)
- Sem autenticacao/autorizacao
- CORS aberto em desenvolvimento
- Docker nao validado neste ambiente (daemon indisponivel)

---

## Diferenciais (opcional — Fase 07)

Pacote **A + C** implementado:

| Diferencial                    | Entrega                                                   |
| ------------------------------ | --------------------------------------------------------- |
| **D1** Comparacao antes/depois | [docs/EVOLUCAO-A2.md](docs/EVOLUCAO-A2.md)                |
| **D2** Evolucao de testes      | 22 → 37 testes documentados em EVOLUCAO-A2                |
| **D3** Diagramas Mermaid       | [docs/ARQUITETURA-A2.md](docs/ARQUITETURA-A2.md)          |
| **D7** Logs simples            | `src/utils/logger.ts` + middleware de requests POST/PATCH |
| **D8** Healthcheck enriquecido | `timestamp`, `uptime`, `database` em GET /api/health      |

Bonus: `toPublicUser()` aplicado em `enrich-ticket.ts` — tickets nao expoem mais senhas aninhadas.

---

## Comparacao antes/depois

| Aspecto                 | Antes (pos-A1)         | Depois (A2)                    |
| ----------------------- | ---------------------- | ------------------------------ |
| Validacao POST /tickets | `if` manual no service | Zod + middleware               |
| GET /users              | Expunha password       | PublicUser                     |
| Testes                  | 22 (so utils)          | 37 (+ service + HTTP + health) |
| Rotas tickets           | Instancia inline       | Factory + middleware           |
| Infra                   | Sem Docker/CI          | Dockerfile + GitHub Actions    |

---

## Arquivos principais alterados

| Area        | Arquivos                                                               |
| ----------- | ---------------------------------------------------------------------- |
| Seguranca   | `users/dtos/public-user.dto.ts`, `users.service.ts`                    |
| Validacao   | `http/from-zod-error.ts`, `http/validate-request.ts`, `dtos/*.dto.ts`  |
| Arquitetura | `composition/*`, `tickets.routes.ts`, `route-handler.ts`               |
| Testes      | `tests/features/tickets/tickets.service.test.ts`, `tests/integration/` |
| Infra       | `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`         |
| Docs        | `README.md`, `docs/VALIDACAO-MANUAL-A2.md`                             |
