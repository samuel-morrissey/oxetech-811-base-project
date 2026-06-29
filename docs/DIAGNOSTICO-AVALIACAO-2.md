# Diagnostico — Avaliacao 2

Documento de acompanhamento da evolucao da codebase na Avaliacao 2.

Branch: `avaliacao-2`  
Ultima atualizacao: 2026-06-28

---

## Baseline (Fase 00 — inicio)

| Comando             | Resultado inicial     |
| ------------------- | --------------------- |
| `npm test`          | 22 testes             |
| `npm run typecheck` | Falha (rotas tickets) |
| Docker / CI         | Inexistente           |
| Zod nos DTOs        | Nao                   |
| GET /users          | Expunha password      |

---

## Estado final (Avaliacao 2)

| Item                              | Status             |
| --------------------------------- | ------------------ |
| Validacao Zod nos DTOs            | OK                 |
| Middleware + Factory              | OK                 |
| Seguranca GET /users              | OK                 |
| Testes service + integracao       | OK — **37 testes** |
| Healthcheck enriquecido           | OK                 |
| Logger + request log              | OK                 |
| Seguranca em tickets enriquecidos | OK                 |
| typecheck / build                 | OK                 |
| Docker                            | Configurado        |
| CI GitHub Actions                 | Configurado        |
| README atualizado                 | OK                 |

---

## Problemas resolvidos

1. Validacao manual → Zod + middleware
2. Testes so em utils → + TicketsService + integracao HTTP
3. Senhas expostas → PublicUser
4. Sem Docker/CI → Dockerfile, compose, workflow
5. Instanciacao acoplada → Factory de composicao
6. Typecheck quebrado → corrigido

---

## Limitacoes remanescentes

- Persistencia sincrona em JSON
- Sem autenticacao
- CORS aberto
- Docker nao validado localmente

---

## Referencias

- [Pull Request A2](PULL-REQUEST-AVALIACAO-2.md)
- [Validacao manual A2](VALIDACAO-MANUAL-A2.md)
- [Tasks por fase](../data/avaliacao-2/tasks/README.md)
- [Diagnostico A1](DIAGNOSTICO-ATIVIDADE-1.md)
