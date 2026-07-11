import { calculateTicketPriority } from "./CalculateTicketPriority";
import { Ticket } from "./Ticket";
import type { TicketCategory, TicketStatus, TicketPriority } from "../types";
import { DatabaseManager } from "../repository";

export class TicketFactory {
    static create(params: {
        title: string;
        description: string;
        category: TicketCategory;
        status: TicketStatus;
        requesterId: string;
        assignedToId?: string;
        createdAt: string;
        updatedAt: string;
    }): Ticket {
        return new Ticket({
            ...params,
            id: this.generateId("ticket"),
            priority: this.calculatePriority(params.category, params.description)
        });
    }

    static generateId(prefix: string) {
        return DatabaseManager.generateId(prefix);
    }

    static calculatePriority(category: TicketCategory, description: string): TicketPriority {
        return calculateTicketPriority(category, description);
    }
}