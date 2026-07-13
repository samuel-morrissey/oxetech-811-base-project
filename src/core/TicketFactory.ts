import { PriorityCalculator } from "./PriorityCalculator";
import { Ticket, TicketPriority, TicketStatus } from "./Ticket";

export class TicketFactory {
    static create(params: {
        title: string;
        description: string;
        category: string;
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
        return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }

    static calculatePriority(category: string, description: string): TicketPriority {
        return PriorityCalculator.calculate(category, description);
    }
}