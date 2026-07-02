import { DatabaseManager } from "../repository";
import { TicketCategory, TicketStatus, User, TicketComment } from "../types";
import { Ticket } from "./Ticket";


export class TicketService {
    static getAllTickets(status?: TicketStatus, category?: TicketCategory, search?: string) {
        const database = DatabaseManager.getInstance().readDatabase();
        let tickets = database.tickets;

        tickets = this.filterTickets(tickets, status, category, search);
        const result = this.addTicketDetails(tickets, database.users, database.comments);
        return result;
    }

    private static filterTickets(tickets: Ticket[], status?: TicketStatus, category?: TicketCategory, search?: string) {
        if (status) {
            tickets = tickets.filter((ticket) => ticket.status === status);
        }

        if (category) {
            tickets = tickets.filter((ticket) => ticket.category === category);
        }

        if (search) {
            const ticketSearch = String(search).toLowerCase();
            tickets = tickets.filter(
                (ticket) =>
                    ticket.title.toLowerCase().includes(ticketSearch) ||
                    ticket.description.toLowerCase().includes(ticketSearch) ||
                    ticket.category.toLowerCase().includes(ticketSearch),
            );
        }

        return tickets;
    }

    private static addTicketDetails(
        tickets: Ticket[],
        users: User[],
        comments: TicketComment[],
    ) {
        const result = tickets.map((ticket) => {
            const requester = users.find((user) => user.id === ticket.requesterId);
            const assigned = users.find((user) => user.id === ticket.assignedToId);
            const ticketcomments = comments.filter((comment) => comment.ticketId === ticket.id);

            return {
                ...ticket,
                requester,
                assigned,
                commentsCount: ticketcomments.length,
            };
        });

        return result;
    }



    static getSummary() {
        const database = DatabaseManager.getInstance().readDatabase();
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

        return summary;
    }

}