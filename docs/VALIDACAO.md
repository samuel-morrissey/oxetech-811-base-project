# Roteiro de Validação Manual

## GET /api/users
- Requisição: GET http://localhost:3000/api/users
- Resultado esperado: lista de usuários com status 200
- Resultado obtido: ✅ ok

## GET /api/tickets
- Requisição: GET http://localhost:3000/api/tickets
- Resultado esperado: lista de tickets com dados de solicitante e responsável, status 200
- Resultado obtido: ✅ ok

## GET /api/tickets/ticket_001
- Requisição: GET http://localhost:3000/api/tickets/ticket_001
- Resultado esperado: detalhes do ticket com comentários, status 200
- Resultado obtido: ✅ ok

## POST /api/tickets
- Requisição: POST http://localhost:3000/api/tickets
- Body: {"title": "Teste", "description": "Testando o post", "category": "sistemas", "requesterId": "user_ana"}
- Resultado esperado: ticket criado com status 201
- Resultado obtido: ✅ ok

## PATCH /api/tickets/ticket_001/status (status inválido)
- Requisição: PATCH http://localhost:3000/api/tickets/ticket_001/status
- Body: {"status": "invalido"}
- Resultado esperado: erro 400 com mensagem de status inválido
- Resultado obtido: ✅ ok