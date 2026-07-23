# Instruções de Teste - Oxetech Helpdesk API

Este documento detalha como executar, monitorar e analisar a cobertura de testes do projeto utilizando a suíte de testes **Vitest**.

---

## 1. Executar os Testes Automatizados (Modo Único)

Para rodar todos os testes unitários e de integração uma única vez:

```bash
npm test
```

Este comando executa as suítes definidas nos seguintes arquivos:
* **Testes de Utilidades:** `src/domain/utils/ticket.utils.test.ts` (regras de prioridade, filtros e sumário).
* **Testes de Sanitização:** `src/domain/utils/ticket.mapper.test.ts` (verificação de omissão de senhas dos usuários).
* **Testes de Serviços (Mocks):** `src/domain/services/ticket.service.test.ts` (regras de negócio do `TicketService` isoladas do banco real).
* **Testes de Integração:** `src/routes.integration.test.ts` (chamadas de endpoints via `supertest`, tratamento de erros e middlewares).

---

## 2. Executar em Modo de Observação (Watch Mode)

Se você estiver modificando código e quiser que os testes rodem automaticamente a cada alteração de arquivo, utilize o modo watch do Vitest:

```bash
npx vitest
```

O Vitest analisará o grafo de dependências e reexecutará **apenas** os testes que dependem do arquivo modificado, economizando tempo.

---

## 3. Cobertura de Código (Code Coverage)

Para saber quais linhas, funções e ramificações condicionais estão sendo cobertas pelos testes, execute:

```bash
npx vitest run --coverage
```

> **Nota:** Na primeira execução, o Vitest solicitará a instalação do pacote `@vitest/coverage-v8`. Digite `y` para autorizar. Ele exibirá a tabela de cobertura no console e gerará um relatório interativo em HTML dentro da pasta `coverage/`.

---

## 4. Interface Gráfica do Vitest (Vitest UI)

O Vitest conta com uma interface gráfica rica e interativa que roda no seu navegador para facilitar a visualização do andamento dos testes:

```bash
npx vitest --ui
```

> **Nota:** Caso solicitado, confirme a instalação do pacote `@vitest/ui` digitando `y`. O terminal fornecerá uma URL local (ex: `http://localhost:51204`) para você abrir no seu navegador.
