# Roteiro de validação manual — Avaliação 1

Este documento descreve como verificar, passo a passo, que a **Oxetech Helpdesk API** continua funcionando corretamente após as refatorações incrementais do projeto.

O roteiro combina **verificações automatizadas** (lint, tipos, build e testes) com **requisições HTTP manuais** via terminal. Foi elaborado para que qualquer revisor consiga reproduzir a validação sem depender de contexto adicional do repositório.

**URL base da API:** `http://localhost:3000/api`

## 1. Preparação do ambiente

Antes de testar os endpoints, certifique-se de que o ambiente atende aos requisitos abaixo.

**Requisitos**

- Node.js 20 ou superior
- Terminal com acesso à raiz do projeto
- Comando `curl` disponível (Git Bash, Linux ou macOS)

**Comandos iniciais**

Execute na ordem indicada:

```bash
npm install
npm run seed
npm run dev
```

Aguarde a mensagem informando que a API está disponível em `http://localhost:3000/api`. Mantenha esse terminal aberto enquanto realiza os testes HTTP.

**Observação sobre os dados**

O comando `npm run seed` recria o arquivo `data/db.json` com usuários e chamados de exemplo. Se você executar casos que alteram tickets (criação, atualização de status ou comentários) e quiser repetir o roteiro do zero, rode `npm run seed` novamente antes de continuar.

## 2. Verificações automatizadas

Com a API parada ou em execução (ambos funcionam), execute os comandos abaixo na raiz do projeto:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

**Resultado esperado:** todos os comandos devem finalizar sem erros. O `npm test` executa a suíte Vitest; o `npm run build` gera a pasta `dist/`.

## 3. Dados de exemplo utilizados nos testes

Após o `npm run seed`, o banco contém os registros abaixo, usados como referência nas expectativas deste roteiro.

| Recurso  | Identificadores                                                          |
| -------- | ------------------------------------------------------------------------ |
| Usuários | `user_ana`, `user_bruno`, `user_carla`                                   |
| Chamados | `ticket_001` (open), `ticket_002` (in_progress), `ticket_003` (resolved) |

## 4. Endpoints — fluxos de sucesso

### 4.1 Healthcheck

**Requisição**

```bash
curl -i http://localhost:3000/api/health
```

**Resultado esperado**

- Status HTTP **200**
- Corpo JSON com `"status": "ok"` e `"service": "oxetech-helpdesk"`

### 4.2 Listar usuários

**Requisição**

```bash
curl -i http://localhost:3000/api/users
```

**Resultado esperado**

- Status HTTP **200**
- Array com **3 usuários**
- Cada item contém os campos `id`, `name`, `email`, `role` e `password`

### 4.3 Listar chamados

**Listagem completa**

```bash
curl -i http://localhost:3000/api/tickets
```

**Resultado esperado**

- Status HTTP **200**
- Array com **3 chamados**
- Cada item inclui os relacionamentos enriquecidos: `requester`, `assigned` (quando existir) e `commentsCount`

**Filtro por status**

```bash
curl -s "http://localhost:3000/api/tickets?status=open"
```

Deve retornar apenas o chamado `ticket_001`.

**Filtro por categoria**

```bash
curl -s "http://localhost:3000/api/tickets?category=infra"
```

Deve retornar apenas o chamado `ticket_002`.

**Filtro por busca textual**

```bash
curl -s "http://localhost:3000/api/tickets?search=login"
```

Deve retornar apenas o chamado `ticket_001`. A busca considera título, descrição e categoria.

### 4.4 Resumo dos chamados

**Requisição**

```bash
curl -i http://localhost:3000/api/tickets/summary
```

**Resultado esperado**

- Status HTTP **200**
- Contagem agregada por status e por prioridade urgente, por exemplo:

```json
{
  "open": 1,
  "in_progress": 1,
  "resolved": 1,
  "closed": 0,
  "urgent": 1
}
```

### 4.5 Detalhar um chamado

**Requisição**

```bash
curl -i http://localhost:3000/api/tickets/ticket_001
```

**Resultado esperado**

- Status HTTP **200**
- Objeto do chamado com `requester`, `assigned` e lista `comments`

Para validar comentários enriquecidos, consulte também `ticket_002`:

```bash
curl -s http://localhost:3000/api/tickets/ticket_002
```

Esse chamado deve retornar ao menos um comentário com o campo `author` preenchido.

### 4.6 Criar chamado

**Requisição**

```bash
curl -i -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nao consigo enviar atividade",
    "description": "Erro ao anexar arquivo da atividade.",
    "category": "sistemas",
    "requesterId": "user_ana"
  }'
```

**Resultado esperado**

- Status HTTP **201**
- Chamado criado com `id` gerado automaticamente (prefixo `ticket_`), `status: "open"` e `priority` calculada a partir da categoria e da descrição

### 4.7 Atualizar status do chamado

**Requisição**

```bash
curl -i -X PATCH http://localhost:3000/api/tickets/ticket_001/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "authorId": "user_carla",
    "comment": "Chamado em atendimento."
  }'
```

**Resultado esperado**

- Status HTTP **200**
- Chamado retornado com `status: "in_progress"` e campo `updatedAt` atualizado

### 4.8 Adicionar comentário

**Requisição**

```bash
curl -i -X POST http://localhost:3000/api/tickets/ticket_001/comments \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "user_carla",
    "message": "Solicitei mais informacoes ao usuario."
  }'
```

**Resultado esperado**

- Status HTTP **201**
- Comentário criado contendo `id`, `ticketId`, `authorId`, `message` e `createdAt`

## 5. Endpoints — casos de erro

A API padroniza erros com corpo JSON contendo `message` e, quando aplicável, o objeto `details` com informações adicionais.

### 5.1 Chamado inexistente (404)

```bash
curl -i http://localhost:3000/api/tickets/ticket_999
```

**Resultado esperado:** HTTP **404** com `"message": "Ticket nao encontrado"` e `"details": { "id": "ticket_999" }`.

### 5.2 Rota inexistente (404)

```bash
curl -i http://localhost:3000/api/rota-inexistente
```

**Resultado esperado:** HTTP **404** com `"message": "Rota nao encontrada"`.

### 5.3 Campos obrigatórios ausentes ao criar chamado (400)

```bash
curl -i -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{ "title": "Sem campos" }'
```

**Resultado esperado:** HTTP **400** com `"message": "Campos obrigatorios ausentes"` e `details.required` listando `title`, `description`, `category` e `requesterId`.

### 5.4 Solicitante inválido (400)

```bash
curl -i -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste",
    "description": "Teste",
    "category": "sistemas",
    "requesterId": "user_invalido"
  }'
```

**Resultado esperado:** HTTP **400** com `"message": "Solicitante invalido"`.

### 5.5 Status inválido (400)

```bash
curl -i -X PATCH http://localhost:3000/api/tickets/ticket_001/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "invalido" }'
```

**Resultado esperado:** HTTP **400** com `"message": "Status invalido"` e `details.allowed` contendo `open`, `in_progress`, `resolved` e `closed`.

### 5.6 Fechar chamado sem comentário (400)

```bash
curl -i -X PATCH http://localhost:3000/api/tickets/ticket_001/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "closed" }'
```

**Resultado esperado:** HTTP **400** com `"message": "Informe um comentario para fechar o chamado"`.

### 5.7 Comentário incompleto (400)

```bash
curl -i -X POST http://localhost:3000/api/tickets/ticket_001/comments \
  -H "Content-Type: application/json" \
  -d '{ "authorId": "user_carla" }'
```

**Resultado esperado:** HTTP **400** com `"message": "Comentario e autor sao obrigatorios"`.

## 6. Conclusão

Ao seguir este roteiro do início ao fim, o revisor consegue confirmar que:

1. A base de código passa nas verificações automatizadas de qualidade e testes.
2. Os principais fluxos da API respondem com os status e campos esperados.
3. Os cenários de erro retornam respostas padronizadas (HTTP 400 e 404) com mensagens claras.

Essas evidências complementam os testes automatizados e demonstram que o comportamento funcional foi preservado ao longo das refatorações da Avaliação 1.
