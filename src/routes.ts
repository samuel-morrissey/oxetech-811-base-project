import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import type { Database, Ticket, TicketPriority, TicketStatus } from "./types";

const router = Router();
const dataFile = process.env.DATA_FILE || "data/db.json";
const databasePath = path.resolve(process.cwd(), dataFile);

// Refatoração: centraliza os status permitidos em uma constante.
// Antes, essa lista ficava diretamente dentro do handler de atualização de status.
const ALLOWED_TICKET_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

// Refatoração: centraliza os campos obrigatórios para criação de chamados.
// Isso evita repetição e deixa mais claro qual é o contrato mínimo do POST /tickets.
const REQUIRED_TICKET_FIELDS = ["title", "description", "category", "requesterId"] as const;

function readDatabase(): Database {
  const content = fs.readFileSync(databasePath, "utf-8");
  return JSON.parse(content) as Database;
}

// Refatoração: declara explicitamente o retorno void.
// A função apenas persiste dados no arquivo, sem retornar valor para o chamador.
function writeDatabase(database: Database): void {
  fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
}

// Refatoração: declara explicitamente o retorno string.
// Isso melhora a legibilidade e deixa claro o contrato da função.
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// Refatoração: centraliza a geração da data atual em ISO.
// Antes, new Date().toISOString() era chamado diretamente em vários pontos.
function getCurrentIsoDate(): string {
  return new Date().toISOString();
}

// Refatoração: extrai a busca de chamado por ID para uma função reutilizável.
// A mesma lógica era necessária em mais de uma rota.
function findTicketById(database: Database, ticketId: string): Ticket | undefined {
  return database.tickets.find((ticket) => ticket.id === ticketId);
}

// Refatoração: extrai a validação de campos obrigatórios do corpo da requisição.
// Isso reduz a responsabilidade direta do handler POST /tickets.
function hasRequiredTicketFields(body: Record<string, unknown>): boolean {
  return REQUIRED_TICKET_FIELDS.every((field) => Boolean(body[field]));
}

// Refatoração: cria um type guard para validar status.
// Além de validar o valor recebido, ajuda o TypeScript a reconhecer o tipo TicketStatus.
function isValidTicketStatus(status: string): status is TicketStatus {
  return ALLOWED_TICKET_STATUSES.includes(status as TicketStatus);
}

function calculatePriority(category: string, description: string): TicketPriority {
  // Refatoração: normaliza a descrição uma única vez.
  // Antes, a transformação para minúsculas era feita diretamente dentro da condição.
  const normalizedDescription = description.toLowerCase();

  if (category === "infra" || normalizedDescription.includes("urgente")) {
    return "urgent";
  }

  if (category === "sistemas" || description.length > 220) {
    return "high";
  }

  if (category === "academico") {
    return "medium";
  }

  return "low";
}

// Refatoração: extrai a lógica de filtros da rota GET /tickets.
// O handler fica mais simples e a regra de filtragem passa a ter uma função dedicada.
function filterTickets(tickets: Ticket[], query: Record<string, unknown>): Ticket[] {
  let filteredTickets = tickets;

  if (query.status) {
    filteredTickets = filteredTickets.filter((ticket) => ticket.status === query.status);
  }

  if (query.category) {
    filteredTickets = filteredTickets.filter((ticket) => ticket.category === query.category);
  }

  if (query.search) {
    const searchTerm = String(query.search).toLowerCase();

    filteredTickets = filteredTickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm) ||
        ticket.category.toLowerCase().includes(searchTerm),
    );
  }

  return filteredTickets;
}

// Refatoração: extrai o enriquecimento usado na listagem de chamados.
// A rota deixa de conhecer os detalhes de montagem do objeto de resposta.
function enrichTicketSummary(ticket: Ticket, database: Database) {
  const requester = database.users.find((user) => user.id === ticket.requesterId);
  const assigned = database.users.find((user) => user.id === ticket.assignedToId);
  const comments = database.comments.filter((comment) => comment.ticketId === ticket.id);

  return {
    ...ticket,
    requester,
    assigned,
    commentsCount: comments.length,
  };
}

// Refatoração: extrai o enriquecimento usado no detalhe de um chamado.
// Essa função centraliza a inclusão de requester, assigned e comentários com autor.
function enrichTicketDetails(ticket: Ticket, database: Database) {
  const requester = database.users.find((user) => user.id === ticket.requesterId);
  const assigned = database.users.find((user) => user.id === ticket.assignedToId);
  const comments = database.comments
    .filter((comment) => comment.ticketId === ticket.id)
    .map((comment) => ({
      ...comment,
      author: database.users.find((user) => user.id === comment.authorId),
    }));

  return { ...ticket, requester, assigned, comments };
}

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
  const database = readDatabase();

  response.json(database.users);
});

router.get("/tickets", (request, response) => {
  const database = readDatabase();

  // Refatoração: o handler passa a delegar a filtragem e o enriquecimento.
  // Isso reduz a quantidade de lógica dentro da rota.
  const tickets = filterTickets(database.tickets, request.query);
  const result = tickets.map((ticket) => enrichTicketSummary(ticket, database));

  response.json(result);
});

router.get("/tickets/summary", (_request, response) => {
  const database = readDatabase();
  const summary = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  };

  for (const ticket of database.tickets) {
    if (ticket.status === "open") summary.open++;
    if (ticket.status === "in_progress") summary.in_progress++;
    if (ticket.status === "resolved") summary.resolved++;
    if (ticket.status === "closed") summary.closed++;
    if (ticket.priority === "urgent") summary.urgent++;
  }

  response.json(summary);
});

router.get("/tickets/:id", (request, response) => {
  const database = readDatabase();

  // Refatoração: usa função auxiliar para buscar o chamado por ID.
  const ticket = findTicketById(database, request.params.id);

  if (!ticket) {
    response.status(404).json({ error: "Ticket nao encontrado", id: request.params.id });
    return;
  }

  // Refatoração: usa função dedicada para montar a resposta detalhada.
  response.json(enrichTicketDetails(ticket, database));
});

router.post("/tickets", (request, response) => {
  const database = readDatabase();
  const body = request.body;

  // Refatoração: validação dos campos obrigatórios foi extraída para função auxiliar.
  if (!hasRequiredTicketFields(body)) {
    response.status(400).json({
      message: "Campos obrigatorios ausentes",
      required: REQUIRED_TICKET_FIELDS,
      received: body,
    });
    return;
  }

  const user = database.users.find((item) => item.id === body.requesterId);
  if (!user) {
    response.status(400).json({ message: "Solicitante invalido" });
    return;
  }

  // Refatoração: a data atual é obtida por função auxiliar.
  // Isso evita repetição e melhora a leitura.
  const now = getCurrentIsoDate();

  const ticket: Ticket = {
    id: generateId("ticket"),
    title: body.title,
    description: body.description,
    category: body.category,
    requesterId: body.requesterId,
    assignedToId: body.assignedToId,
    status: "open",
    priority: calculatePriority(body.category, body.description),
    createdAt: now,
    updatedAt: now,
  };

  database.tickets.push(ticket);
  writeDatabase(database);

  response.status(201).json(ticket);
});

router.patch("/tickets/:id/status", (request, response) => {
  const database = readDatabase();

  // Refatoração: usa função auxiliar para localizar o chamado.
  const ticket = findTicketById(database, request.params.id);
  const newStatus = request.body.status;

  if (!ticket) {
    response.status(404).json({ message: "Ticket nao encontrado" });
    return;
  }

  // Refatoração: a validação de status foi extraída para um type guard.
  // A lista de status permitidos também foi centralizada em constante.
  if (!isValidTicketStatus(newStatus)) {
    response.status(400).json({ message: "Status invalido", allowed: ALLOWED_TICKET_STATUSES });
    return;
  }

  if (newStatus === "closed" && !request.body.comment) {
    response.status(400).json({ message: "Informe um comentario para fechar o chamado" });
    return;
  }

  ticket.status = newStatus;
  ticket.updatedAt = getCurrentIsoDate();

  if (request.body.comment) {
    database.comments.push({
      id: generateId("comment"),
      ticketId: ticket.id,
      authorId: request.body.authorId || ticket.requesterId,
      message: request.body.comment,
      createdAt: getCurrentIsoDate(),
    });
  }

  writeDatabase(database);
  response.json(ticket);
});

router.post("/tickets/:id/comments", (request, response) => {
  const database = readDatabase();

  // Refatoração: reutiliza a busca de chamado por ID.
  const ticket = findTicketById(database, request.params.id);
  const body = request.body;

  if (!ticket) {
    response.status(404).json({ error: "Ticket nao encontrado" });
    return;
  }

  if (!body.message || !body.authorId) {
    response.status(400).json({ error: "Comentario e autor sao obrigatorios" });
    return;
  }

  const comment = {
    id: generateId("comment"),
    ticketId: ticket.id,
    authorId: body.authorId,
    message: body.message,
    createdAt: getCurrentIsoDate(),
  };

  database.comments.push(comment);
  ticket.updatedAt = getCurrentIsoDate();
  writeDatabase(database);

  response.status(201).json(comment);
});

export default router;