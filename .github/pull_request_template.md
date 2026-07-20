## Diagnostico
	
	- Os principais problemas encontrados foram os magic number/String e os endpoint que feriam o primeiro 	princípio do SOLID, o princípio da responsabilidade única.

## Mudancas realizadas

	- Magic number (function calculatePriority)
	- Magic String (function calculatePriority)
	- Long Funtion (router.get("/tickets", (request, response)))
	- Single Responsibility Principle (router.get("/tickets/summary", (_request, response)))
	- Single Responsibility Principle (router.patch("/tickets/:id/status", (request, response)))

## Conceitos aplicados

	- Clean Code para refatoração 
	- SOLID para identificação de endpoints/funções de atenção
	- Code Smells

## Evidencias de funcionamento

	- Valide a funcionalidade através do `npm run typecheck` e testando todos os endpoint depois de cada 	refatoração.

## Limitacoes conhecidas

Análise dos demais endpoints.