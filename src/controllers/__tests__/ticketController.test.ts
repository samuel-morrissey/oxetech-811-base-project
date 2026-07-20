import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ALLOWED_STATUSES,
  HTTP_STATUS,
  MESSAGES,
  REQUIRED_TICKET_FIELDS,
} from "../../constants";
import * as parsers from "../../dtos/parseTicketDtos";
import * as db from "../../repositories/database";
import * as service from "../../services/ticketService";
import type { Database, Ticket, TicketComment } from "../../types";
import {
  addComment,
  create,
  getById,
  list,
  summary,
  updateStatus,
} from "../ticketController";
import { makeReq, makeRes } from "./httpFakes";

vi.mock("../../services/ticketService");
vi.mock("../../dtos/parseTicketDtos");
vi.mock("../../repositories/database");

const mockedService = vi.mocked(service);
const mockedParsers = vi.mocked(parsers);
const mockedDb = vi.mocked(db);

function baseTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "t1",
    title: "titulo",
    description: "descricao",
    category: "sistemas",
    status: "open",
    priority: "high",
    requesterId: "user_ana",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("list", () => {
  it("delega para listTickets com filtros extraidos de request.query", () => {
    mockedService.listTickets.mockReturnValue([]);
    const { res, json } = makeRes();

    list(
      makeReq({ query: { status: "open", category: "infra", search: "wifi" } }),
      res,
    );

    expect(mockedService.listTickets).toHaveBeenCalledWith({
      status: "open",
      category: "infra",
      search: "wifi",
    });
    expect(json).toHaveBeenCalledWith([]);
  });

  it("passa undefined quando nao ha query params", () => {
    mockedService.listTickets.mockReturnValue([]);
    const { res } = makeRes();

    list(makeReq(), res);

    expect(mockedService.listTickets).toHaveBeenCalledWith({
      status: undefined,
      category: undefined,
      search: undefined,
    });
  });
});

describe("summary", () => {
  it("conta status e prioridade urgent", () => {
    const database: Database = {
      users: [],
      tickets: [
        baseTicket({ id: "t1", status: "open", priority: "urgent" }),
        baseTicket({ id: "t2", status: "open", priority: "low" }),
        baseTicket({ id: "t3", status: "in_progress", priority: "high" }),
        baseTicket({ id: "t4", status: "resolved", priority: "medium" }),
        baseTicket({ id: "t5", status: "closed", priority: "urgent" }),
      ],
      comments: [],
    };
    mockedDb.readDatabase.mockReturnValue(database);

    const { res, json } = makeRes();
    summary(makeReq(), res);

    expect(json).toHaveBeenCalledWith({
      open: 2,
      in_progress: 1,
      resolved: 1,
      closed: 1,
      urgent: 2,
    });
  });
});

describe("getById", () => {
  it("retorna o ticket quando encontrado", () => {
    const ticket = baseTicket();
    mockedService.getTicketById.mockReturnValue({
      ...ticket,
      requester: undefined,
      assigned: undefined,
      comments: [],
    });

    const { res, status, json } = makeRes();
    getById(makeReq({ params: { id: "t1" } }), res);

    expect(status).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ id: "t1" }));
  });

  it("retorna 404 quando o ticket nao existe", () => {
    mockedService.getTicketById.mockReturnValue(null);
    const { res, status, json } = makeRes();

    getById(makeReq({ params: { id: "missing" } }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      error: MESSAGES.TICKET_NOT_FOUND,
      id: "missing",
    });
  });
});

describe("create", () => {
  it("retorna 400 quando parse falha", () => {
    mockedParsers.parseCreateTicketInput.mockReturnValue({
      success: false,
      code: "missing_fields",
      received: { title: "" },
    });

    const { res, status, json } = makeRes();
    create(makeReq({ body: { title: "" } }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      message: MESSAGES.MISSING_FIELDS,
      required: REQUIRED_TICKET_FIELDS,
      received: { title: "" },
    });
    expect(mockedService.createTicket).not.toHaveBeenCalled();
  });

  it("retorna 400 quando service devolve invalid_requester", () => {
    mockedParsers.parseCreateTicketInput.mockReturnValue({
      success: true,
      data: {
        title: "t",
        description: "d",
        category: "sistemas",
        requesterId: "user_missing",
      },
    });
    mockedService.createTicket.mockReturnValue({
      success: false,
      error: { code: "invalid_requester" },
    });

    const { res, status, json } = makeRes();
    create(makeReq({ body: {} }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({ message: MESSAGES.INVALID_REQUESTER });
  });

  it("retorna 201 com ticket em caso de sucesso", () => {
    const ticket = baseTicket();
    mockedParsers.parseCreateTicketInput.mockReturnValue({
      success: true,
      data: {
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        requesterId: ticket.requesterId,
      },
    });
    mockedService.createTicket.mockReturnValue({ success: true, ticket });

    const { res, status, json } = makeRes();
    create(makeReq({ body: {} }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    expect(json).toHaveBeenCalledWith(ticket);
  });
});

describe("updateStatus", () => {
  it("retorna 400 com allowed statuses quando invalid_status", () => {
    mockedParsers.parseUpdateTicketStatusInput.mockReturnValue({
      success: false,
      code: "invalid_status",
    });

    const { res, status, json } = makeRes();
    updateStatus(makeReq({ params: { id: "t1" }, body: {} }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      message: MESSAGES.INVALID_STATUS,
      allowed: ALLOWED_STATUSES,
    });
  });

  it("retorna 400 generico quando missing_fields", () => {
    mockedParsers.parseUpdateTicketStatusInput.mockReturnValue({
      success: false,
      code: "missing_fields",
    });

    const { res, status, json } = makeRes();
    updateStatus(makeReq({ params: { id: "t1" }, body: {} }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({ message: MESSAGES.INVALID_STATUS });
  });

  it("retorna 404 quando service devolve not_found", () => {
    mockedParsers.parseUpdateTicketStatusInput.mockReturnValue({
      success: true,
      data: { status: "in_progress" },
    });
    mockedService.updateTicketStatus.mockReturnValue({
      success: false,
      error: { code: "not_found" },
    });

    const { res, status, json } = makeRes();
    updateStatus(makeReq({ params: { id: "missing" }, body: {} }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({ message: MESSAGES.TICKET_NOT_FOUND });
  });

  it("retorna 400 quando service devolve comment_required_to_close", () => {
    mockedParsers.parseUpdateTicketStatusInput.mockReturnValue({
      success: true,
      data: { status: "closed" },
    });
    mockedService.updateTicketStatus.mockReturnValue({
      success: false,
      error: { code: "comment_required_to_close" },
    });

    const { res, status, json } = makeRes();
    updateStatus(makeReq({ params: { id: "t1" }, body: {} }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      message: MESSAGES.COMMENT_REQUIRED_TO_CLOSE,
    });
  });

  it("retorna 200 com o ticket em caso de sucesso", () => {
    const ticket = baseTicket({ status: "in_progress" });
    mockedParsers.parseUpdateTicketStatusInput.mockReturnValue({
      success: true,
      data: { status: "in_progress" },
    });
    mockedService.updateTicketStatus.mockReturnValue({ success: true, ticket });

    const { res, status, json } = makeRes();
    updateStatus(makeReq({ params: { id: "t1" }, body: {} }), res);

    expect(status).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith(ticket);
  });
});

describe("addComment", () => {
  const comment: TicketComment = {
    id: "c1",
    ticketId: "t1",
    authorId: "user_ana",
    message: "oi",
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  it("retorna 400 quando parse falha", () => {
    mockedParsers.parseAddTicketCommentInput.mockReturnValue({
      success: false,
      code: "missing_fields",
    });

    const { res, status, json } = makeRes();
    addComment(makeReq({ params: { id: "t1" }, body: {} }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      error: MESSAGES.COMMENT_AND_AUTHOR_REQUIRED,
    });
    expect(mockedService.addTicketComment).not.toHaveBeenCalled();
  });

  it("retorna 404 quando service devolve not_found", () => {
    mockedParsers.parseAddTicketCommentInput.mockReturnValue({
      success: true,
      data: { message: "oi", authorId: "user_ana" },
    });
    mockedService.addTicketComment.mockReturnValue({
      success: false,
      error: { code: "not_found" },
    });

    const { res, status, json } = makeRes();
    addComment(makeReq({ params: { id: "missing" }, body: {} }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({ error: MESSAGES.TICKET_NOT_FOUND });
  });

  it("retorna 201 com o comment em caso de sucesso", () => {
    mockedParsers.parseAddTicketCommentInput.mockReturnValue({
      success: true,
      data: { message: "oi", authorId: "user_ana" },
    });
    mockedService.addTicketComment.mockReturnValue({ success: true, comment });

    const { res, status, json } = makeRes();
    addComment(makeReq({ params: { id: "t1" }, body: {} }), res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    expect(json).toHaveBeenCalledWith(comment);
  });
});
