# Evolucao — Avaliacao 2

Comparacao objetiva entre o estado pos-Avaliacao 1 e a entrega final da Avaliacao 2.

---

## Resumo executivo

| Aspecto              | Antes (pos-A1)                                         | Depois (A2)                             |
| -------------------- | ------------------------------------------------------ | --------------------------------------- |
| Validacao de entrada | `if` manual no service                                 | Zod + middleware HTTP                   |
| GET /users           | Expunha `password`                                     | `PublicUser` sem senha                  |
| Tickets enriquecidos | Expunham `password` em `requester`/`assigned`/`author` | `toPublicUser()` em todo enriquecimento |
| Testes               | 22 (somente utils)                                     | 37 (+ service, integracao, health)      |
| Rotas                | Instanciacao inline                                    | Factory + middleware                    |
| Healthcheck          | `{ status, service }`                                  | + `timestamp`, `uptime`, `database`     |
| Observabilidade      | `console.log` ad hoc                                   | Logger centralizado + log de writes     |
| Infra                | Sem Docker/CI                                          | Dockerfile + GitHub Actions             |

---

## Evolucao de testes (D2)

| Metrica              | A1  | A2  |
| -------------------- | --- | --- |
| Total de testes      | 22  | 37  |
| TicketsService       | 0   | 8   |
| Integracao HTTP      | 0   | 4   |
| Health               | 0   | 2   |
| Utils (enrich, etc.) | 22  | 23  |

**Comportamentos novos cobertos:**

- Criar ticket com requester valido/invalido
- Fechar ticket exige comentario
- Filtros de listagem (status, category, search)
- Respostas HTTP 201/400/404 via supertest
- Healthcheck com status do arquivo de banco
- Enriquecimento de tickets sem expor senha

---

## Snippets antes/depois

### Validacao — antes (service)

```typescript
if (!dto.title?.trim()) {
  throw new BadRequest("Titulo e obrigatorio");
}
```

### Validacao — depois (middleware + Zod)

```typescript
router.post(
  "/",
  validateBody(createTicketSchema),
  routeHandler(controller.create),
);
```

### Seguranca — antes (users)

```typescript
findAll(): User[] {
  return this.repository.findAll();
}
```

### Seguranca — depois (users)

```typescript
findAll(): PublicUser[] {
  return this.repository.findAll().map(toPublicUser);
}
```

### Rotas — antes

```typescript
const controller = new TicketsController(
  new TicketsService(ticketsRepo, usersRepo),
);
router.post("/", (req, res) => controller.create(req, res));
```

### Rotas — depois

```typescript
const { controller } = createTicketsModule();
router.post(
  "/",
  validateBody(createTicketSchema),
  routeHandler(controller.create),
);
```

---

## Commits incrementais (D5)

A evolucao foi entregue em commits separados por tema:

1. `feat: adiciona minima seguranca removendo senha do get de users`
2. `feat: valida entrada http com schemas zod e mapear erros para badrequest`
3. `refactor: organiza camada http com middleware de validacao e factory`
4. `test: adiciona testes unitarios do TicketsService e integracao http`
5. `chore: adiciona docker e ci com github action`
6. (Fase 06/07) docs + diferenciais

---

## Referencias

- [Arquitetura A2](ARQUITETURA-A2.md)
- [Diagnostico A2](DIAGNOSTICO-AVALIACAO-2.md)
- [Pull Request](PULL-REQUEST-AVALIACAO-2.md)
