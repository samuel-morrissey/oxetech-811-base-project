# Oxetech Helpdesk API

Esta e uma codebase-base para exercicios de refatoracao incremental. O projeto simula uma API simples de chamados de suporte academico.

O objetivo nao e reconstruir o sistema do zero. O objetivo e entender a aplicacao existente, identificar problemas tecnicos, fazer melhorias pequenas e justificar as decisoes por Pull Request.

## Requisitos

- Node.js 20 ou superior
- npm
- Docker e Docker Compose (para o PostgreSQL e o Mailpit)

## Como rodar

Instale as dependencias:

```bash
npm install
```

Suba o PostgreSQL e o Mailpit (servidor de email de teste):

```bash
docker compose up -d
```

Copie o arquivo de ambiente. Os valores ja apontam para os containers do Docker:

```bash
cp .env.example .env
```

Crie o schema no banco e gere o Prisma Client:

```bash
npm run db:push
```

Popule os dados de exemplo:

```bash
npm run seed
```

Execute em modo desenvolvimento:

```bash
npm run dev
```

A API ficara disponivel em `http://localhost:3000/api`. Os emails enviados
ao criar chamados podem ser inspecionados na interface web do Mailpit em
`http://localhost:8025`.

## Scripts

- `npm run dev`: executa a API em modo desenvolvimento.
- `npm run db:push`: aplica o schema do Prisma no banco (`prisma db push`).
- `npm run prisma:migrate`: cria/aplica migrations versionadas (`prisma migrate dev`).
- `npm run prisma:generate`: (re)gera o Prisma Client.
- `npm run seed`: popula o banco com os dados de exemplo.
- `npm run typecheck`: valida os tipos TypeScript.
- `npm run build`: gera o Prisma Client e compila o projeto para `dist`.
- `npm test`: executa os testes unitarios e de integracao.

## Autenticacao

A API usa um sistema simples de autenticacao por **cookie de sessao**. Ao fazer
login, o servidor grava um cookie `session` com o id do usuario. Um middleware
verifica esse cookie em todas as rotas protegidas (apenas autenticacao; nao ha
regras de autorizacao por papel).

Clientes de API como **Postman** ou **Bruno** guardam e reenviam cookies
automaticamente: basta chamar `POST /api/auth/login` uma vez e as requisicoes
seguintes ja irao autenticadas.

Rotas publicas: `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/logout`.
Todas as demais (`/api/users`, `/api/tickets...`, `/api/auth/me`) exigem sessao;
sem cookie valido a resposta e `401 { "message": "Nao autenticado" }`.

As credenciais de exemplo sao impressas ao rodar `npm run seed`. Por exemplo:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ana.aluna@example.com",
  "password": "123456"
}
```

```http
GET /api/auth/me
POST /api/auth/logout
```

## Endpoints principais

### Healthcheck

```http
GET /api/health
```

### Listar usuarios

```http
GET /api/users
```

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

Exige sessao. A autoria (solicitante) e sempre o usuario autenticado, entao o
`requesterId` **nao** e enviado no corpo.

```http
POST /api/tickets
Content-Type: application/json

{
  "title": "Nao consigo enviar atividade",
  "description": "O sistema apresenta erro ao anexar o arquivo da atividade.",
  "category": "sistemas"
}
```

### Atualizar status

Exige sessao. Se um comentario for informado, sua autoria e do usuario logado.

```http
PATCH /api/tickets/ticket_001/status
Content-Type: application/json

{
  "status": "in_progress",
  "comment": "Chamado em atendimento."
}
```

### Adicionar comentario

Exige sessao. A autoria do comentario e sempre o usuario autenticado.

```http
POST /api/tickets/ticket_001/comments
Content-Type: application/json

{
  "message": "Solicitei mais informacoes ao usuario."
}
```

## Jornada de refatoracao

Trabalhe em Pull Requests pequenos e bem explicados.

Em cada PR, registre:

- quais problemas voce encontrou;
- quais melhorias foram feitas;
- quais conceitos do curso foram aplicados;
- como voce verificou que o comportamento continua funcionando;
- quais limitacoes continuam existindo.

Consulte [docs/CHECKPOINTS.md](docs/CHECKPOINTS.md) para entender o escopo esperado de cada entrega.