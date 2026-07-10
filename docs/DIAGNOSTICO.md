# Diagnóstico da Codebase

Documento atualizado após a Avaliação 1, como ponto de partida da Avaliação 2.

## O que já melhorou (Avaliação 1)

- Persistência isolada em `database.ts` (leitura/escrita do JSON).
- Operações de tickets e usuários extraídas para `ticketRepository` e `userRepository`.
- Constantes nomeadas no lugar de magic number / magic strings.
- Roteiro de validação manual em `docs/VALIDACAO.md`.

## Problemas que ainda existem

### 1. Mistura de responsabilidades em `routes.ts`

O arquivo de rotas ainda concentra:

- entrada HTTP (request/response);
- regras de negócio (prioridade, filtros, regras de status);
- acesso direto ao banco em alguns fluxos (ex.: atualizar status e adicionar comentário).

Isso dificulta leitura, teste e evolução do código.

### 2. Validação de entrada incompleta

Alguns endpoints checam campos obrigatórios, mas de forma superficial:

- strings vazias podem passar;
- categoria não é validada contra valores conhecidos;
- respostas de erro não seguem um formato único.

### 3. Tratamento de erros inconsistente

Há respostas com `message` e outras com `error`. Status HTTP e corpo da resposta variam sem um padrão claro.

### 4. Ausência de testes automatizados

O script `npm test` ainda é um placeholder. A validação depende de testes manuais, o que não cobre bem regressões em regras importantes (ex.: cálculo de prioridade e criação de chamado).

### 5. Organização arquitetural ainda rasa

Existe separação inicial de infraestrutura (database + repositories), mas falta uma camada clara de regra de negócio entre as rotas e a persistência.

## Direção da Avaliação 2

Sem reescrever o projeto, o foco desta entrega é:

1. Separar melhor HTTP, regra de negócio e infraestrutura.
2. Melhorar pelo menos um fluxo relevante (criação/atualização de tickets).
3. Padronizar validação e erros de forma simples.
4. Adicionar testes úteis para comportamentos importantes.
5. Atualizar o README com execução e testes.
6. Aplicar um pattern básico quando fizer sentido no contexto atual.
