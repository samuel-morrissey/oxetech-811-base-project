import { Request, Response, NextFunction } from "express";
import { TicketStatus } from '../types';

export function patchTicketStatusMiddleware(request: Request, response: Response, next: NextFunction) {
    const newStatus = request.body.status as TicketStatus;
    const comment = request.body.comment as string;
    const statuses: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

    if (!statuses.includes(newStatus)) {
        return response.status(400).json({ error: "Status invalido", allowed: statuses });
    }

    if (newStatus === "closed" && !comment) {
        return response.status(400).json({ error: "Informe um comentario para fechar o chamado" });
    }

    next();
}
