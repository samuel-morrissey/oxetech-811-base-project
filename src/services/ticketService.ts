import type { Database, Ticket, TicketPriority } from "../types";
import { generateId } from "../utils/generateId";

const HIGH_PRIORITY_MIN_LENGTH = 220;

export interface PriorityRule {
    matches(fields: PriorityFields): boolean;
    readonly priority: TicketPriority;
}

export interface PriorityFields {
    category: string;
    description: string;
}

export class UrgentPriorityRule implements PriorityRule {
    readonly priority: TicketPriority = "urgent";

    matches(fields: PriorityFields): boolean {
        return (
            fields.category === "infra" ||
            fields.description.toLowerCase().includes("urgente")
        );
    }
}

export class HighPriorityRule implements PriorityRule {
    readonly priority: TicketPriority = "high";

    matches(fields: PriorityFields): boolean {
        return fields.category === "sistemas" || fields.description.length > HIGH_PRIORITY_MIN_LENGTH;
    }
}

export class MediumPriorityRule implements PriorityRule {
    readonly priority: TicketPriority = "medium";

    matches(fields: PriorityFields): boolean {
        return fields.category === "academico";
    }
}

export const priorityRules: PriorityRule[] = [
    new UrgentPriorityRule(),
    new HighPriorityRule(),
    new MediumPriorityRule(),
];

export const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export function calculatePriority(
    category: string,
    description: string,
): TicketPriority {
    const matchedRule = priorityRules.find((rule) =>
        rule.matches({ category, description }),
    );
    return matchedRule?.priority ?? "low";
}

export function findTicketById(database: Database, id: string): Ticket | undefined {
    return database.tickets.find((ticket: Ticket) => ticket.id === id);
}

export interface CreateCommentInput {
	ticketId: string;
	authorId: string;
	message: string;
}

export function createComment(input: CreateCommentInput) {
	return {
		id: generateId("comment"),
		ticketId: input.ticketId,
		authorId: input.authorId,
		message: input.message,
		createdAt: new Date().toISOString(),
	};
}
