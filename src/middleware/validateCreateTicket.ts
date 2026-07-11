import { Request, Response, NextFunction } from "express";
import { TicketCategory } from "../types";
import { ERROR_MESSAGES } from "../constante.error";

export function validateCreateTicket(request: Request, response: Response, next: NextFunction) {
    const body = request.body;
    const ticketCategories: TicketCategory[] = ["academico", "infra", "sistemas"];

    if (!body.title || !body.description || !body.category || !body.requesterId) {
        response.status(400).json({
            message: ERROR_MESSAGES.REQUIRED_FIELDS_MISSING,
            required: ["title", "description", "category", "requesterId"],
            received: body,
        });
        return;
    }

    if (!ticketCategories.includes(body.category)) {
        response.status(400).json({
            message: ERROR_MESSAGES.INVALID_CATEGORY,
            allowed: ticketCategories,
            received: body.category,
        });
        return;
    }

    if (typeof body.title !== "string" || typeof body.description !== "string" || typeof body.requesterId !== "string") {
        response.status(400).json({
            message: ERROR_MESSAGES.REQUIRED_FIELDS_MUST_BE_STRING,
            required: ["title", "description", "category", "requesterId"],
            received: body,
        });
        return;
    }

    next();
}