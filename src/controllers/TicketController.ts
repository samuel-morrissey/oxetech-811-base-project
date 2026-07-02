import type { Ticket, TicketStatus } from "../types";
import { DatabaseManager, } from "../repository";
import { TicketService } from "../services/TicketService";


export class TicketController {
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
}




