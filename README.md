# Oxetech Helpdesk API

Esta e uma codebase-base para exercicios de refatoracao incremental. O projeto simula uma API simples de chamados de suporte academico.

O objetivo nao e reconstruir o sistema do zero. O objetivo e entender a aplicacao existente, identificar problemas tecnicos, fazer melhorias pequenas e justificar as decisoes por Pull Request.

## Requisitos

- Node.js 20 ou superior
- npm

## Como rodar

Instale as dependencias:

```bash
npm install
```

Reinicie os dados de exemplo, se necessario:

```bash
npm run seed
```

Execute em modo desenvolvimento:

```bash
npm run dev
```

A API ficara disponivel em `http://localhost:3000/api`.

## Scripts

- `npm run dev`: executa a API em modo desenvolvimento.
- `npm run seed`: recria o arquivo de dados inicial.
- `npm test`: executa a suíte de testes com Vitest.
- `npm run test:watch`: executa testes em modo watch.
- `npm run test:coverage`: executa testes com relatório de cobertura.
- `npm run typecheck`: valida os tipos TypeScript.
- `npm run build`: compila o projeto para `dist`.

Os testes ficam em `tests/`, espelhando a estrutura de `src/`.

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

Trabalhe em Pull Requests pequenos e bem explicados.

Em cada PR, registre:

- quais problemas voce encontrou;
- quais melhorias foram feitas;
- quais conceitos do curso foram aplicados;
- como voce verificou que o comportamento continua funcionando;
- quais limitacoes continuam existindo.

Consulte [docs/CHECKPOINTS.md](docs/CHECKPOINTS.md) para entender o escopo esperado de cada entrega.

Documentos da **Avaliação 1**:

- [Diagnóstico inicial](docs/DIAGNOSTICO-ATIVIDADE-1.md)
- [Validação manual](docs/VALIDACAO-MANUAL-A1.md)
- [Texto do Pull Request](docs/PULL-REQUEST-AVALIACAO-1.md)
