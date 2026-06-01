# Diagnóstico da Codebase — Avaliação 1

Documento de análise do estado inicial do projeto, antes das refatorações da Avaliação 1. Esse md serve como base para justificar as mudanças no Pull Request.

## Visão geral

A **Oxetech Helpdesk API** é uma API REST em Node.js/TypeScript que simula um sistema de chamados de suporte acadêmico. A persistência é feita em um arquivo JSON (`data/db.json`), sem banco relacional.

### Fluxo de execução

1. `server.ts` sobe um servidor Express na porta `3000` (ou `PORT` do ambiente).
2. Todas as rotas ficam sob o prefixo `/api`.
3. Cada requisição que altera ou consulta dados lê o JSON inteiro do disco, processa em memória e, quando necessário, reescreve o arquivo.

### Rotas disponíveis

| Método | Rota                        | Responsabilidade                                         |
| ------ | --------------------------- | -------------------------------------------------------- |
| GET    | `/api/health`               | Healthcheck da API                                       |
| GET    | `/api/users`                | Lista usuários cadastrados                               |
| GET    | `/api/tickets`              | Lista chamados (filtros: `status`, `category`, `search`) |
| GET    | `/api/tickets/summary`      | Contagem por status e prioridade urgente                 |
| GET    | `/api/tickets/:id`          | Detalhe do chamado com comentários                       |
| POST   | `/api/tickets`              | Cria chamado e calcula prioridade automaticamente        |
| PATCH  | `/api/tickets/:id/status`   | Atualiza status (exige comentário ao fechar)             |
| POST   | `/api/tickets/:id/comments` | Adiciona comentário ao chamado                           |

### Modelo de dados

Definido em `types.ts` (tudo agregado):

- **User**: aluno, professor ou suporte (inclui senha em texto plano no seed).
- **Ticket**: chamado com categoria, status, prioridade e vínculos com usuários.
- **TicketComment**: comentário associado a um chamado.
- **Database**: agregado `{ users, tickets, comments }` persistido no JSON.

O script `npm run seed` recria o arquivo `data/db.json` com dados de exemplo.

## Code smells encontrados

### 1. God file: `routes.ts` concentra responsabilidades demais ferindo S do SOLID

O arquivo `routes.ts` mistura:

- definição de rotas HTTP (Express);
- leitura e escrita de arquivo (`readDatabase`, `writeDatabase`);
- regras de negócio (`calculatePriority`);
- utilitários (`generateId`);
- montagem de respostas enriquecidas (requester, assigned, comments).

### 2. Duplicação de persistência entre `routes.ts` e `seed.ts`

Os dois arquivos resolvem o caminho do banco e escrevem JSON de forma independente:

```ts
const dataFile = process.env.DATA_FILE || "data/db.json";
const databasePath = path.resolve(process.cwd(), dataFile);
```

Em `routes.ts` há `readDatabase`/`writeDatabase`; em `seed.ts` há `writeFileSync` direto com dados hardcoded, dados puros.

### 3. Duplicação na busca de usuários e enriquecimento de tickets

O padrão `database.users.find((user) => user.id === ...)` aparece repetido em:

- listagem de tickets (requester e assigned);
- detalhe de ticket (requester, assigned e author de cada comentário);
- criação de ticket (validação do requester).

A montagem de ticket com relacionamentos em `GET /tickets` e `GET /tickets/:id` segue lógica semelhante, mas implementada duas vezes.

### 4. Magic strings e validação inline de status

Status válidos aparecem como literais espalhados:

- `"open"` ao criar ticket;
- comparações no loop de summary (`"open"`, `"in_progress"`, etc.);
- array inline na validação do PATCH: `["open", "in_progress", "resolved", "closed"]`.

Embora o tipo `TicketStatus` exista em `types.ts`, a validação em runtime não reutiliza uma fonte única.

**Impacto:** adicionar ou renomear um status exige caça manual por strings no código.

### 5. Respostas de erro inconsistentes

Os endpoints não seguem um formato único:

| Situação                      | Campo usado | Exemplo                                            |
| ----------------------------- | ----------- | -------------------------------------------------- |
| Ticket não encontrado (GET)   | `error`     | `{ error: "Ticket nao encontrado", id: "..." }`    |
| Ticket não encontrado (PATCH) | `message`   | `{ message: "Ticket nao encontrado" }`             |
| Comentário inválido           | `error`     | `{ error: "Comentario e autor sao obrigatorios" }` |
| Campos obrigatórios (POST)    | `message`   | `{ message: "Campos obrigatorios ausentes", ... }` |

### 6. Regra de negócio acoplada ao handler HTTP

`calculatePriority` vive dentro de `routes.ts`, embora seja regra pura de domínio (categoria + descrição → prioridade). A função não depende de Express nem de arquivo.

### 7. Handlers longos e validação manual repetitiva

Rotas como `POST /tickets` e `PATCH /tickets/:id/status` combinam validação de entrada, busca no banco, mutação de estado e persistência no mesmo bloco, sem funções auxiliares nomeadas.

Code smell de **função longa** e **validação duplicada** (padrão if/return com `response.status(400)` copiado).

### 8. Ausência de testes automatizados

O script `npm test` é um placeholder que apenas imprime mensagem e retorna sucesso. Não há cobertura de regras de negócio nem smoke test automatizado.

### 9. Ausência de linter, formatter e hooks de pre-commit

Não há ESLint, Prettier, Commitlint nem Lefthook configurados. O estilo depende de disciplina manual.

### 10. Persistência síncrona e leitura total a cada requisição

Cada endpoint chama `readDatabase()` (e eventualmente `writeDatabase()`), lendo o arquivo inteiro de forma síncrona (`readFileSync`/`writeFileSync`).

## Resumo

A codebase cumpre seu papel como **aplicação legada didática**: funciona, é pequena e expõe problemas clássicos (arquivo grande, duplicação, mistura de camadas, falta de testes e ferramentas de qualidade).

## Evolução

| Item                                             | Status    | Observação                                                       |
| ------------------------------------------------ | --------- | ---------------------------------------------------------------- |
| God file `routes.ts` (smell #1)                  | Resolvido | Estrutura feature-based; controllers, services e repositories    |
| Duplicação de persistência (smell #2)            | Resolvido | `config/database`, `utils/json-database`; seed reutiliza módulos |
| Duplicação de usuários/enriquecimento (smell #3) | Resolvido | Repositories + `enrich-ticket.ts`                                |
| Magic strings de status (smell #4)               | Resolvido | `ticket-status.ts` + `isValidTicketStatus`                       |
| Erros inconsistentes (smell #5)                  | Resolvido | `ApiError`, `NotFound`, `BadRequest` + middleware                |
| Regra acoplada ao HTTP (smell #6)                | Resolvido | `calculate-priority.ts` em utils da feature                      |
| Handlers longos (smell #7)                       | Resolvido | Controllers finos; lógica em services                            |
| Ausência de testes (smell #8)                    | Resolvido | Vitest + 22 testes; cobertura mínima 70% em utils                |
| Ausência de linter/hooks (smell #9)              | Resolvido | ESLint, Prettier, Commitlint, Lefthook                           |
| Persistência síncrona (smell #10)                | Parcial   | Centralizada em módulo único; otimização futura                  |
