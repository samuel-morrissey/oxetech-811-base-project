# Oxetech Helpdesk API

API de chamados de suporte acadêmico, usada como base para exercícios de refatoração incremental ao longo do curso de Engenharia de Software Moderna.

O objetivo não é reconstruir o sistema do zero, e sim evoluir a aplicação existente em pequenos Pull Requests: identificar problemas técnicos, aplicar os conceitos do curso e justificar as decisões por escrito.

## Requisitos

- Node.js 20 ou superior
- npm

## Como rodar

Instale as dependências:

```bash
npm install
```

Crie os dados de exemplo (obrigatório na primeira execução):

```bash
npm run seed
```

Execute em modo desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3000/api`.

## Como rodar com Docker

Sem instalar Node localmente, com Docker:

```bash
docker build -t oxetech-helpdesk .
docker run --rm -p 3000:3000 oxetech-helpdesk
```

O container semeia o banco na primeira execução e sobe a API em `http://localhost:3000/api`. Para persistir os dados entre execuções, monte um volume em `/app/data`:

```bash
docker run --rm -p 3000:3000 -v "$(pwd)/data:/app/data" oxetech-helpdesk
```

## Testes e verificação

```bash
npm test          # executa a suíte de testes (Vitest)
npm run typecheck # valida os tipos TypeScript (análise estática)
npm run build     # compila o projeto para dist/
```

A suíte cobre as regras de negócio (`TicketService`, cálculo de prioridade), a camada de dados e os middlewares de validação. A mesma sequência (`typecheck` → `test` → `build`) roda automaticamente no CI a cada push e Pull Request.

## Scripts

- `npm run dev`: executa a API em modo desenvolvimento (hot reload).
- `npm run seed`: recria o arquivo de dados inicial em `data/db.json`.
- `npm run typecheck`: valida os tipos TypeScript sem gerar saída.
- `npm run build`: compila o projeto para `dist`.
- `npm start`: executa a versão compilada (`dist/server.js`).
- `npm test`: executa a suíte de testes com Vitest.
- `npm run test:watch`: executa os testes em modo observação.

## Arquitetura

A partir da Avaliação 2, a aplicação segue uma arquitetura em camadas com injeção de dependências manual, isolando transporte HTTP, regra de negócio e persistência:

```
Cliente HTTP
   │
   ▼
Rotas (src/routes.ts) ── Middlewares (validação de entrada + tratamento de erro)
   │
   ▼
Controllers (src/controllers/)   → leem a requisição HTTP e delegam
   │
   ▼
Services (src/services/)         → regras de negócio puras, sem dependência do Express
   │
   ▼
Repositories (src/repositories/) → acesso aos dados (arquivo JSON)
   │
   ▼
Banco (data/db.json)
```

Padrões aplicados:

- **Repository Pattern**: `UserRepository` e `TicketRepository` isolam o acesso ao banco, permitindo trocar a persistência sem alterar a regra de negócio.
- **Strategy Pattern**: o cálculo de prioridade é decomposto em regras independentes (`IPriorityRule`) avaliadas pelo `PriorityCalculator`, permitindo adicionar novas regras sem modificar o fluxo principal.
- **Injeção de dependências**: repositórios e serviços são injetados via construtor; a composição acontece em `src/routes.ts`.

Validação de entrada e tratamento de erro são centralizados: `src/middlewares/validation.middleware.ts` valida o corpo das requisições no runtime, e `src/middlewares/error.middleware.ts`, junto com a classe `AppError`, padroniza todas as respostas de erro no formato `{ "error": "..." }`.

## Endpoints principais

### Healthcheck

```http
GET /api/health
```

### Listar usuários

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

`category` aceita apenas `infra`, `sistemas` ou `academico`. Campos em branco ou tipos inválidos são rejeitados com HTTP 400.

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

`status` aceita `open`, `in_progress`, `resolved` ou `closed`. Fechar um chamado (`closed`) exige um `comment`.

### Adicionar comentário

```http
POST /api/tickets/ticket_001/comments
Content-Type: application/json

{
  "authorId": "user_carla",
  "message": "Solicitei mais informacoes ao usuario."
}
```

## Jornada de refatoração

Trabalhe em Pull Requests pequenos e bem explicados. Em cada PR, registre:

- quais problemas você encontrou;
- quais melhorias foram feitas;
- quais conceitos do curso foram aplicados;
- como você verificou que o comportamento continua funcionando;
- quais limitações continuam existindo.

Consulte [docs/CHECKPOINTS.md](docs/CHECKPOINTS.md) para entender o escopo esperado de cada entrega.
