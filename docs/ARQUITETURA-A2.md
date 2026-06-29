# Arquitetura — Avaliacao 2

Visao das camadas e fluxos principais da Oxetech Helpdesk API apos a Avaliacao 2.

---

## Camadas

```mermaid
flowchart TB
  subgraph HTTP["Camada HTTP"]
    Routes["Routes"]
    MW["Middleware<br/>validateBody / validateQuery / requestLogger"]
    RH["routeHandler"]
    EH["apiErrorHandler"]
  end

  subgraph Composition["Composicao"]
    FTM["createTicketsModule()"]
    FUM["createUsersModule()"]
  end

  subgraph Features["Features"]
    Ctrl["Controllers"]
    Svc["Services"]
    Repo["Repositories"]
  end

  subgraph Infra["Infra"]
    JSON["JsonDatabase<br/>data/db.json"]
    Logger["logger.ts"]
  end

  Client((Cliente HTTP)) --> Routes
  Routes --> MW --> RH --> Ctrl
  Ctrl --> Svc --> Repo --> JSON
  Routes --> EH
  FTM --> Ctrl
  FUM --> Ctrl
  MW --> Logger
```

---

## Fluxo POST /api/tickets

```mermaid
sequenceDiagram
  participant C as Cliente
  participant R as tickets.routes
  participant V as validateBody
  participant H as routeHandler
  participant Ctrl as TicketsController
  participant S as TicketsService
  participant TR as TicketsRepository
  participant UR as UsersRepository
  participant DB as db.json

  C->>R: POST /api/tickets + JSON
  R->>V: createTicketSchema
  alt payload invalido
    V-->>C: 400 BadRequest
  end
  V->>H: req.body validado
  H->>Ctrl: create()
  Ctrl->>S: create(dto)
  S->>UR: findById(requesterId)
  alt requester inexistente
    S-->>C: 404 NotFound
  end
  S->>TR: create(ticket)
  TR->>DB: persist
  S-->>Ctrl: ticket enriquecido
  Ctrl-->>C: 201 Created
```

---

## Modulos e responsabilidades

| Pasta              | Responsabilidade                                 |
| ------------------ | ------------------------------------------------ |
| `src/routes/`      | Agregacao de routers por feature                 |
| `src/http/`        | Middleware, validacao, tratamento de erros       |
| `src/composition/` | Factories que montam controller + service + repo |
| `src/features/*/`  | Dominio por feature (health, tickets, users)     |
| `src/utils/`       | Logger, helpers transversais                     |
| `src/config/`      | Env e caminho do banco                           |

---

## Patterns aplicados

| Pattern         | Onde                                            |
| --------------- | ----------------------------------------------- |
| **Middleware**  | Validacao Zod, request logger, error handler    |
| **Factory**     | `createTicketsModule`, `createUsersModule`      |
| **Repository**  | Abstracao de persistencia JSON                  |
| **DTO publico** | `PublicUser` / `toPublicUser` na borda de saida |

---

## Referencias

- [Evolucao A2](EVOLUCAO-A2.md)
- [README](../README.md)
