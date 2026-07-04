import { DatabaseManager } from "../repository";
import { TicketCategory, TicketStatus, User, TicketComment } from "../types";
import { Ticket } from "./Ticket";
import { TicketFactory } from "./TicketFactory";


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

    static getTicketById(ticketId: string) {
        const database = DatabaseManager.getInstance().readDatabase();
        const ticket = database.tickets.find((item) => item.id === ticketId);

        if (!ticket) {
            return null;
        }

        const requester = database.users.find((user) => user.id === ticket.requesterId);
        const assigned = database.users.find((user) => user.id === ticket.assignedToId);
        const comments = database.comments
            .filter((comment) => comment.ticketId === ticket.id)
            .map((comment) => ({
                ...comment,
                author: database.users.find((user) => user.id === comment.authorId),
            }));

        return {
            ...ticket,
            requester,
            assigned,
            comments,
        };
    }

    static getUser(userId: string) {
        const database = DatabaseManager.getInstance().readDatabase();
        const user = database.users.find((item) => item.id === userId);

        return user || null;
    }

    static postTicket(params: {
        title: string;
        description: string;
        category: TicketCategory;
        requesterId: string;
        assignedToId?: string;
    }) {
        const database = DatabaseManager.getInstance().readDatabase();

        const user = TicketService.getUser(params.requesterId);

        if (!user) {
            return null;
        }

        const now = new Date().toISOString();
        const ticket = TicketFactory.create({
            title: params.title,
            description: params.description,
            category: params.category,
            requesterId: params.requesterId,
            assignedToId: params.assignedToId,
            status: "open",
            createdAt: now,
            updatedAt: now,
        });

        database.tickets.push(ticket);
        DatabaseManager.getInstance().writeDatabase(database);
        return ticket;
    }
}