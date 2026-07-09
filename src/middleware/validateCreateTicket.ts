import { Request, Response, NextFunction } from "express";
import { TicketCategory } from "../types";


export function validateCreateTicket(request: Request, response: Response, next: NextFunction) {
    const body = request.body;
    const ticketCategories: TicketCategory[] = ["academico", "infra", "sistemas"];

    if (!body.title || !body.description || !body.category || !body.requesterId) {
        response.status(400).json({
            message: "Campos obrigatorios ausentes",
            required: ["title", "description", "category", "requesterId"],
            received: body,
        });
        return;
    }

    if (!ticketCategories.includes(body.category)) {
        response.status(400).json({
            message: "Categoria invalida",
            allowed: ticketCategories,
            received: body.category,
        });
        return;
    }

    if (typeof body.title !== "string" || typeof body.description !== "string" || typeof body.requesterId !== "string") {
        response.status(400).json({
            message: "Campos obrigatorios devem ser do tipo string",
            required: ["title", "description", "category", "requesterId"],
            received: body,
        });
        return;
    }

    next();
}