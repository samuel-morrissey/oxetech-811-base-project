import type { TicketCategory, TicketPriority, TicketStatus } from "../types";

export class Ticket {
    id: string;
    title: string;
    description: string;
    category: TicketCategory;
    status: TicketStatus;
    priority: TicketPriority;
    requesterId: string;
    assignedToId?: string;
    createdAt: string;
    updatedAt: string;

    constructor(params: {
        id: string;
        title: string;
        description: string;
        category: TicketCategory;
        status: TicketStatus;
        priority: TicketPriority;
        requesterId: string;
        assignedToId?: string;
        createdAt: string;
        updatedAt: string;
    }) {
        this.id = params.id;
        this.title = params.title;
        this.description = params.description;
        this.category = params.category;
        this.status = params.status;
        this.priority = params.priority;
        this.requesterId = params.requesterId;
        this.assignedToId = params.assignedToId;
        this.createdAt = params.createdAt;
        this.updatedAt = params.updatedAt;
    }
}


