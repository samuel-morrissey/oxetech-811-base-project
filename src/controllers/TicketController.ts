import type { Ticket, TicketStatus } from "../types";
import { DatabaseManager, } from "../repository";


export class TicketController {
    static getAllTickets(request: any, response: any) {
        const database = DatabaseManager.getInstance().readDatabase();
        let tickets = database.tickets;

        if (request.query.status) {
            tickets = tickets.filter((ticket) => ticket.status === request.query.status);
        }

        if (request.query.category) {
            tickets = tickets.filter((ticket) => ticket.category === request.query.category);
        }

        if (request.query.search) {
            const search = String(request.query.search).toLowerCase();
            tickets = tickets.filter(
                (ticket) =>
                    ticket.title.toLowerCase().includes(search) ||
                    ticket.description.toLowerCase().includes(search) ||
                    ticket.category.toLowerCase().includes(search),
            );
        }

        const result = tickets.map((ticket) => {
            const requester = database.users.find((user) => user.id === ticket.requesterId);
            const assigned = database.users.find((user) => user.id === ticket.assignedToId);
            const comments = database.comments.filter((comment) => comment.ticketId === ticket.id);

            return {
                ...ticket,
                requester,
                assigned,
                commentsCount: comments.length,
            };
        });

        response.json(result);
    }
}


