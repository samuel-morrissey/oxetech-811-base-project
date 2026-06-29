# Validacao manual — Avaliacao 2

Roteiro executado em 2026-06-28 na branch `avaliacao-2`.

Base URL: `http://localhost:3000/api`

---

## Registro de evidencias

| #   | Cenario                         | Status   | Observacao                       |
| --- | ------------------------------- | -------- | -------------------------------- |
| 1   | GET /api/health                 | OK       | 200                              |
| 2   | GET /api/users sem password     | OK       | Resposta sem campo `password`    |
| 3   | POST /api/tickets valido        | OK       | 201, status `open`               |
| 4   | POST /api/tickets sem title     | OK       | 400, `details.issues`            |
| 5   | POST requester invalido         | OK       | 400, regra de negocio            |
| 6   | PATCH status invalido           | OK       | 400 via Zod                      |
| 7   | PATCH closed sem comment        | OK       | 400                              |
| 8   | GET /api/tickets/:id 404        | OK       | 404 com `details.id`             |
| 9   | GET /api/tickets?status=open    | OK       | 200, lista filtrada              |
| 10  | GET /api/tickets/summary        | OK       | 200                              |
| 11  | Lint + typecheck + test + build | OK       | 35 testes                        |
| 12  | Docker compose                  | Pendente | Validar com Docker Desktop ativo |

Cenarios 1–10 validados via `curl` e testes de integracao (`tests/integration/`).

---

## Comandos de verificacao automatizada

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Resultado: todos passaram (35 testes).

---

## Referencia completa

Cenarios detalhados: [`data/avaliacao-2/validacao-manual.md`](../data/avaliacao-2/validacao-manual.md)
