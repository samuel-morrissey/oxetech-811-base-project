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
}




