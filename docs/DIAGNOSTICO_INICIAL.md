# Diagnóstico Inicial da Codebase

## 1. Visão geral

A aplicação é uma API simples de chamados de suporte acadêmico. Ela permite listar usuários, listar chamados, filtrar chamados, consultar resumo, detalhar chamado, criar chamado, atualizar status e adicionar comentários.

## 2. Objetivo da evolução

O objetivo desta primeira etapa é realizar uma evolução incremental da codebase, com foco em Clean Code, identificação de code smells, pequenas refatorações, melhoria de legibilidade e preservação do comportamento existente.

Não será feita reescrita completa da aplicação nem alteração estrutural profunda nesta etapa.

## 3. Estado inicial

Comandos executados para validar o estado inicial:

- npm install
- npm run seed
- npm run dev
- npm run typecheck
- npm run build
- npm test

## 4. Endpoints verificados manualmente

- GET /api/health
- GET /api/users
- GET /api/tickets
- GET /api/tickets?status=open
- GET /api/tickets?category=infra
- GET /api/tickets?search=login
- GET /api/tickets/summary
- GET /api/tickets/ticket_001
- POST /api/tickets
- PATCH /api/tickets/ticket_001/status
- POST /api/tickets/ticket_001/comments

## 5. Problemas técnicos identificados

- Possível concentração de responsabilidades em poucos arquivos.
- Possível mistura entre lógica HTTP, regra de negócio e acesso a dados.
- Validações de entrada ainda pouco centralizadas.
- Tratamento de erros possivelmente inconsistente.
- Testes automatizados ainda ausentes ou iniciais.
- O projeto ainda pode evoluir em documentação técnica, validação e organização.

## 6. Estratégia para a Avaliação 1

A primeira evolução será limitada a refatorações pequenas e revisáveis, priorizando:

- melhoria de nomes;
- extração de funções auxiliares;
- redução de duplicações simples;
- organização de responsabilidades sem mudança arquitetural profunda;
- preservação do comportamento existente;
- documentação clara das decisões no Pull Request.

## 7. Critério de aceite

A refatoração será considerada adequada se:

- os endpoints existentes continuarem funcionando;
- o build e o typecheck continuarem passando;
- o comportamento esperado for preservado;
- o Pull Request for pequeno, compreensível e bem justificado;
- as alterações forem compatíveis com o escopo introdutório da Avaliação 1.

## 8. Refatorações realizadas na Avaliação 1

Nesta Avaliação 1, a refatoração ficou concentrada em `src/routes.ts`, pois a maior parte da lógica da API estava centralizada nesse arquivo.

As principais melhorias foram:

- centralização dos status permitidos em `ALLOWED_TICKET_STATUSES`;
- centralização dos campos obrigatórios em `REQUIRED_TICKET_FIELDS`;
- extração da busca de chamado por ID para `findTicketById`;
- extração da validação de campos obrigatórios para `hasRequiredTicketFields`;
- criação de um type guard para validar status em `isValidTicketStatus`;
- extração da filtragem de chamados para `filterTickets`;
- extração da montagem da resposta resumida para `enrichTicketSummary`;
- extração da montagem da resposta detalhada para `enrichTicketDetails`;
- centralização da geração de data ISO em `getCurrentIsoDate`.

Essas mudanças melhoram legibilidade e organização sem alterar o comportamento esperado da API.