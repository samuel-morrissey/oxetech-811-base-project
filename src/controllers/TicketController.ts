import type { Ticket, TicketStatus } from "../types";
import { DatabaseManager, } from "../repository";
import { TicketService } from "../services/TicketService";
import { TicketFactory } from "../services/TicketFactory";


export class TicketController {
    static getHealth(request: any, response: any) {
        response.json({ status: "ok", service: "oxetech-helpdesk" });
    }

    static getAllUsers(request: any, response: any) {
        const database = DatabaseManager.getInstance().readDatabase();
        response.json(database.users);
    }

    static getAllTickets(request: any, response: any) {
        const result = TicketService.getAllTickets(request.query.status, request.query.category, request.query.search);
        response.json(result);
    }

    static getSummary(request: any, response: any) {
        response.json(TicketService.getSummary());
    }

    static getTicketById(request: any, response: any) {
        const ticket = TicketService.getTicketById(request.params.id);

        if (!ticket) {
            response.status(404).json({ "error": "Ticket nao encontrado", "id": request.params.id });
            return;
        }

        response.json(ticket);
    }

    static postTicket(request: any, response: any) {
        const body = request.body;

        if (!body.title || !body.description || !body.category || !body.requesterId) {
            response.status(400).json({
                message: "Campos obrigatorios ausentes",
                required: ["title", "description", "category", "requesterId"],
                received: body,
            });
            return;
        }

        const ticket = TicketService.postTicket({
            title: body.title,
            description: body.description,
            category: body.category,
            requesterId: body.requesterId,
            assignedToId: body.assignedToId,
        });

        if (!ticket) {
            return response.status(400).json({
                message: "Solicitante invalido"
            });
        }

        response.status(201).json(ticket);
    }

    static patchTicketStatus(request: any, response: any) {
        const ticketId = request.params.id;
        const newStatus = request.body.status as TicketStatus;
        const comment = request.body.comment;
        const authorId = request.body.authorId;

        const result = TicketService.patchTicketStatus(ticketId, newStatus, comment, authorId);

        if (!result.success) {
            if (result.message === "Ticket nao encontrado") {
                return response.status(404).json({ message: result.message });
            }

            if (result.allowed) {
                return response.status(400).json({ message: result.message, allowed: result.allowed });
            }

            return response.status(400).json({ message: result.message });
        }

        response.json(result.ticket);
    }

}




