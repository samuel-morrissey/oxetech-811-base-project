import { Request, Response, NextFunction } from "express";
import { TicketStatus } from '../types';
import { ERROR_MESSAGES } from "../constante.error";

export function patchTicketStatusMiddleware(request: Request, response: Response, next: NextFunction) {
    const newStatus = request.body.status as TicketStatus;
    const comment = request.body.comment as string;
    const statuses: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
    const closingStatus: TicketStatus = "closed";

    if (!statuses.includes(newStatus)) {
        return response.status(400).json({ error: ERROR_MESSAGES.INVALID_STATUS, allowed: statuses });
    }

    if (newStatus === closingStatus && !comment) {
        return response.status(400).json({ error: ERROR_MESSAGES.COMMENT_REQUIRED_FOR_CLOSING });
    }

    next();
}
