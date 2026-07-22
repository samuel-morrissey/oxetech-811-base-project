# Oxetech Helpdesk API

Esta e uma codebase-base para exercicios de refatoracao incremental. O projeto simula uma API simples de chamados de suporte academico.

O objetivo nao e reconstruir o sistema do zero. O objetivo e entender a aplicacao existente, identificar problemas tecnicos, fazer melhorias pequenas e justificar as decisoes por Pull Request.

## Requisitos

Antes de comecar, garanta que voce tem instalado:

- **Node.js 20 ou superior** — verifique com `node --version`
- **npm** (ja vem junto com o Node.js) — verifique com `npm --version`
- **Git** — para clonar o repositorio

## Como rodar o projeto

Siga os passos abaixo na ordem apresentada.

### 1. Clone o repositorio

```bash
git clone <url-do-repositorio>
cd oxetech-811-base-project
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Popule os dados de exemplo

Este comando cria o arquivo de dados inicial usado pela API:

```bash
npm run seed
```

> Rode novamente sempre que quiser reiniciar os dados de exemplo do zero.

### 4. Suba a API em modo desenvolvimento

```bash
npm run dev
```

A API ficara disponivel em **http://localhost:3000/api**.

Para verificar rapidamente se tudo esta funcionando, acesse o healthcheck:

```bash
curl http://localhost:3000/api/health
```

## Scripts disponiveis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Executa a API em modo desenvolvimento com reload automatico. |
| `npm run seed` | Recria o arquivo de dados inicial. |
| `npm run typecheck` | Valida os tipos TypeScript sem gerar build. |
| `npm run build` | Compila o projeto para a pasta `dist`. |
| `npm start` | Roda a versao ja compilada (`dist/server.js`). Execute `npm run build` antes. |
| `npm test` | Placeholder inicial. Testes devem ser criados durante a evolucao. |

## Endpoints principais

Todos os endpoints estao sob o prefixo `/api`.

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

## Problemas comuns

- **`EADDRINUSE: address already in use :::3000`** — a porta 3000 ja esta ocupada. Encerre o outro processo ou libere a porta antes de rodar novamente.
- **`command not found: npm`** — Node.js/npm nao esta instalado ou nao esta no PATH. Reinstale o Node.js.
- **Dados inconsistentes ou faltando** — rode `npm run seed` para recriar o arquivo de dados inicial.

## Jornada de refatoracao

Trabalhe em Pull Requests pequenos e bem explicados.

Em cada PR, registre:

- quais problemas voce encontrou;
- quais melhorias foram feitas;
- quais conceitos do curso foram aplicados;
- como voce verificou que o comportamento continua funcionando;
- quais limitacoes continuam existindo.

Consulte [docs/CHECKPOINTS.md](docs/CHECKPOINTS.md) para entender o escopo esperado de cada entrega.
