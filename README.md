# Oxetech Helpdesk Monorepo

Este projeto é um monorepo para o sistema **Oxetech Helpdesk**, contendo uma aplicação web em React (frontend) e uma API Node.js Express integrada com o Prisma ORM e PostgreSQL (backend). Ele também deixa o espaço estruturado para incluir uma futura aplicação mobile em React Native.

---

## 📁 Estrutura de Pastas

* **`backend/`**: API de chamados desenvolvida com Express, Prisma ORM e PostgreSQL. Inclui suite de testes automatizados com Vitest.
* **`frontend/`**: Aplicação Web de painel construída em React + Vite, estilizada com Vanilla CSS premium e configurada para hot-reload.
* **`mobile/`**: (Espaço reservado) Pasta futura para a aplicação móvel em React Native.
* **`docker-compose.yml`**: Orquestrador na raiz do projeto contendo os containers de banco de dados, API, frontend e servidor de email local.

---

## 🛠️ Requisitos

* Docker e Docker Compose instalados na máquina host (ou integrados ao WSL).
* Node.js v20+ e npm (caso deseje rodar comandos/testes de forma local fora dos containers).

---

## 🚀 Como Executar o Projeto com Docker

Para iniciar todo o ecossistema (Postgres + Backend + Frontend + Mailpit) com suporte a hot-reload:

1. **Subir os containers:**
   ```bash
   docker compose up -d --build
   ```

2. **Aplicar Migrations (criar as tabelas no Postgres):**
   ```bash
   docker compose exec back npx prisma migrate deploy
   ```

3. **Popular o Banco de Dados (Seed):**
   ```bash
   docker compose exec back npm run seed
   ```

---

## 🌐 Endereços e Portas

* **Interface Web (React):** [http://localhost:5173](http://localhost:5173)
* **Backend API (Express):** [http://localhost:3000/api](http://localhost:3000/api)
  * Rota de saúde: [http://localhost:3000/api/health](http://localhost:3000/api/health)
* **Mailpit (Visualização de Emails):** [http://localhost:8025](http://localhost:8025)
* **PostgreSQL:** `localhost:5432` (Usuário: `oxetech` / Senha: `oxetech` / Banco: `oxetech`)

---

## 🧪 Como Executar os Testes Automatizados (Vitest)

Os testes automatizados e o typecheck de tipos TypeScript devem ser rodados dentro da pasta `/backend/`:

1. **Entrar na pasta:**
   ```bash
   cd backend
   ```
2. **Executar a suite de testes (21 testes passando):**
   ```bash
   npm test
   ```
3. **Verificar os tipos estáticos (TypeScript):**
   ```bash
   npm run typecheck
   ```
4. **Verificar cobertura de código:**
   ```bash
   npx vitest run --coverage
   ```

Para ver instruções de testes mais detalhadas, consulte o arquivo [docs/TESTS_README.md](file:///home/jaspion/projetos/oxetech-811-base-project/docs/TESTS_README.md).

---

## 🚦 Endpoints Principais da API

* `GET /api/health` - Healthcheck do serviço.
* `GET /api/users` - Lista os usuários (com dados confidenciais sanitizados).
* `GET /api/tickets` - Lista e filtra chamados por `status`, `category` ou termo de busca `search`.
* `GET /api/tickets/summary` - Retorna a contagem de chamados por status e prioridades urgentes.
* `GET /api/tickets/:id` - Detalha um chamado específico incluindo os comentários associados.
* `POST /api/tickets` - Cria um novo chamado (com validações de categoria e solicitante).
* `PATCH /api/tickets/:id/status` - Altera o status de um chamado (exige comentário ao fechar).
* `POST /api/tickets/:id/comments` - Insere um novo comentário em um chamado.