# Oxetech Helpdesk API

API REST em Node.js/TypeScript para chamados de suporte academico. Projeto de refatoracao incremental do curso 811.

## Quick start

```bash
npm install
npm run seed
npm run dev
```

API disponivel em `http://localhost:3000/api`.

## Requisitos

- Node.js 20+
- npm
- Docker (opcional, para execucao em container)

## Scripts

| Script                  | Descricao                                    |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | API em modo desenvolvimento                  |
| `npm run seed`          | Recria `data/db.json`                        |
| `npm start`             | Executa build de producao (`dist/server.js`) |
| `npm test`              | Suite de testes (Vitest)                     |
| `npm run test:coverage` | Testes com cobertura                         |
| `npm run lint`          | ESLint                                       |
| `npm run typecheck`     | Verificacao de tipos                         |
| `npm run build`         | Compila TypeScript para `dist/`              |

## Testes

```bash
npm test
npm run test:coverage
```

A suite inclui:

- testes unitarios de utils e services (`tests/features/`)
- testes de integracao HTTP com supertest (`tests/integration/`)

## Executando com Docker

Antes de subir o container, garanta dados locais (o compose monta `./data`):

```bash
npm run seed
docker compose up --build
```

A API ficara em `http://localhost:3000/api`.

Build manual:

```bash
docker build -t oxetech-helpdesk .
docker run -p 3000:3000 -v "$(pwd)/data:/app/data" oxetech-helpdesk
```

## Integracao continua

![CI](https://github.com/Talyslan/software-engineering-oxetech-academy/actions/workflows/ci.yml/badge.svg)

Pipeline em [`.github/workflows/ci.yml`](.github/workflows/ci.yml): **lint**, **typecheck**, **testes** e **build** a cada push/PR.

## Estrutura do projeto

```
src/
├── app.ts                 # createApp() — Express configurado
├── server.ts              # Entry point (listen)
├── composition/           # Factory de modulos (tickets, users)
├── features/              # health, tickets, users
│   └── */                 # controller, service, repository, dtos
├── http/                  # ApiError, middleware, validacao
├── routes/                # Agregador de rotas
└── utils/                 # persistencia JSON, helpers
tests/
├── features/              # unitarios
└── integration/           # HTTP (supertest)
data/
└── avaliacao-2/           # documentacao e tasks da Avaliacao 2
```

## Endpoints principais

### Healthcheck

```http
GET /api/health
```

Resposta inclui `timestamp`, `uptime` (segundos) e status do arquivo de banco (`database`: `reachable` | `missing`).

```json
{
  "status": "ok",
  "service": "oxetech-helpdesk",
  "timestamp": "2026-06-28T12:00:00.000Z",
  "uptime": 42,
  "database": "reachable"
}
```

### Listar usuarios

```http
GET /api/users
```

Resposta **nao inclui** campo `password`.

### Listar chamados

```http
GET /api/tickets
GET /api/tickets?status=open
GET /api/tickets?category=infra
GET /api/tickets?search=login
```

### Resumo dos chamados

```http
GET /api/tickets/summary
```

### Detalhar chamado

```http
GET /api/tickets/ticket_001
```

### Criar chamado

```http
POST /api/tickets
Content-Type: application/json

{
  "title": "Nao consigo enviar atividade",
  "description": "O sistema apresenta erro ao anexar o arquivo da atividade.",
  "category": "sistemas",
  "requesterId": "user_ana"
}
```

### Atualizar status

```http
PATCH /api/tickets/ticket_001/status
Content-Type: application/json

{
  "status": "in_progress",
  "authorId": "user_carla",
  "comment": "Chamado em atendimento."
}
```

### Adicionar comentario

```http
POST /api/tickets/ticket_001/comments
Content-Type: application/json

{
  "authorId": "user_carla",
  "message": "Solicitei mais informacoes ao usuario."
}
```

## Jornada de refatoracao

Trabalhe em Pull Requests pequenos e bem explicados. Consulte [docs/CHECKPOINTS.md](docs/CHECKPOINTS.md).

### Avaliacao 1

- [Diagnostico inicial](docs/DIAGNOSTICO-ATIVIDADE-1.md)
- [Validacao manual A1](docs/VALIDACAO-MANUAL-A1.md)

### Avaliacao 2

- [Diagnostico A2](docs/DIAGNOSTICO-AVALIACAO-2.md)
- [Evolucao A2](docs/EVOLUCAO-A2.md)
- [Arquitetura A2](docs/ARQUITETURA-A2.md)
- [Validacao manual A2](docs/VALIDACAO-MANUAL-A2.md)
- [Texto do Pull Request](docs/PULL-REQUEST-AVALIACAO-2.md)
- [Tasks e guias](data/avaliacao-2/tasks/README.md)

## Como avaliar esta entrega

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run seed && npm run dev
# ou: npm run seed && docker compose up --build
curl http://localhost:3000/api/health
curl http://localhost:3000/api/users
```
