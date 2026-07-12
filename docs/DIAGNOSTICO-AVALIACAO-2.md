# Diagnóstico e Evolução da Codebase — Avaliação 2

Documento do Projeto Integrador Oxetech Helpdesk: diagnóstico atualizado após a Avaliação 1, problemas encontrados e plano de evolução.

**Referência de escopo:** `docs/CHECKPOINTS.md`

**Estado herdado da Avaliação 1:** Strategy (prioridade), Facade (`helpdeskFacade`), SRP (funções pequenas por fluxo). Ver `docs/DIAGNOSTICO-AVALIACAO-1.md`.

---

## Resumo executivo

A Avaliação 1 aplicou Strategy, Facade e SRP dentro de `src/routes.ts`, deixando as rotas finas e a lógica organizada em funções pequenas. Mas o Facade **reorganizou responsabilidades sem separá-las fisicamente**: entrada HTTP, regra de negócio e persistência continuam no mesmo arquivo, e em alguns pontos a própria regra de negócio já carrega detalhes de HTTP (como o código de status). Essa é a crítica central desta avaliação: existir um Facade não é o mesmo que ter camadas separadas.

---

## Problemas encontrados

### 1. Tudo em um único módulo

`src/routes.ts` (471 linhas) concentra rotas Express, o objeto `helpdeskFacade`, as regras de prioridade (`priorityRules`) e as funções de persistência (`readDatabase`/`writeDatabase`). Não há fronteira física entre camadas — apenas organização lógica dentro do mesmo arquivo.

### 2. Persistência acoplada direto na regra de negócio

`helpdeskFacade` chama `readDatabase()`/`writeDatabase()` diretamente (`src/routes.ts:313, 366` e outros pontos). Não existe repositório/gateway de dados; trocar a fonte (de JSON para um banco real, por exemplo) exigiria mexer na regra de negócio.

### 3. Regra de negócio carrega detalhe de HTTP

O tipo `FacadeResult` (`src/routes.ts:61`) inclui `status: number`. A camada de regra de negócio já decide o código HTTP (400, 404, 201...), que é responsabilidade da borda de entrada, não da regra de negócio.

### 4. Validação de entrada manual e incompleta

Os handlers confiam no formato de `request.body`/`request.query` sem validação de tipo real — `hasRequiredTicketFields` e `hasRequiredCommentFields` fazem apenas checagens `Boolean(...)`. Campos como `assignedToId` (em `createTicket`) e `authorId` (em `addComment`/`updateTicketStatus`) nunca são checados contra a lista de usuários existente — podem referenciar IDs inexistentes silenciosamente.

### 5. Contrato de erro inconsistente

Erros ora usam `{ message: ... }`, ora `{ error: ... }` (`src/routes.ts:128, 134, 233, 297`). Não há formato único de erro nem tratamento central — `src/server.ts` não possui middleware de erro.

### 6. Ausência de testes automatizados

Só existe roteiro manual (`tests/endpoints.http`, executado via `httpyac`). Não há verificação automática de regressão para regra de prioridade, validação ou persistência.

### 7. Segurança básica pendente (herdado da Avaliação 1)

`password` continua exposta em `listUsers` e em todo enrich de ticket — `enrichTicketListItem`/`enrichTicketDetail` fazem spread do objeto `User` completo, incluindo a senha.

### 8. Persistência frágil (herdado da Avaliação 1)

I/O síncrono sem tratamento de erro de arquivo, sem lock para escrita concorrente, e `generateId` usando `Date.now()` + número aleatório (risco de colisão).

---

## Plano de evolução 

| # | Frente | Status |
|---|--------|--------|
| 1 | Diagnóstico atualizado | Em andamento (este documento) |
| 2 | Separação em camadas (HTTP / regra de negócio / persistência), possivelmente em módulos com dependências claras | Pendente |
| 3 | Melhoria de fluxo relevante — validar `assignedToId` e `authorId` contra usuários existentes | Pendente |
| 4 | Validação de entrada (DTOs/schema) na borda HTTP e na regra de negócio | Pendente |
| 5 | Tratamento de erros consistente (classes de erro + middleware central) | Pendente |
| 6 | Testes unitários e de integração (novo test runner a definir) | Pendente |
| 7 | Correção de problemas básicos de segurança (exposição de `password`) | Pendente |

---

Soluções e Decisões Técnicas
---

*Documento em construção — seções de solução e decisões serão adicionadas conforme cada frente do plano for concluída.*
