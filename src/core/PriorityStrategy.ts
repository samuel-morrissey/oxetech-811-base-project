import { TicketPriority } from "./Ticket";

export interface PriorityStrategy {
    isApplicable(category: string, description: string): boolean;
    calculate(category: string, description: string): TicketPriority;
}

export class DefaultPriorityStrategy implements PriorityStrategy {
    isApplicable(category: string, description: string): boolean {
        return true;
    }

    calculate(category: string, description: string): TicketPriority {
        return "low";
    }
}

export class MediumPriorityStrategy implements PriorityStrategy {
    isApplicable(category: string, description: string): boolean {
        return category === "academico" || category === "financeiro";
    }
    calculate(category: string, description: string): TicketPriority {
        return "medium";
    }
}

export class HighPriorityStrategy implements PriorityStrategy {
    isApplicable(category: string, description: string): boolean {
        return category === "sistemas" || description.length > 220;
    }
    calculate(category: string, description: string): TicketPriority {
        return "high";
    }
}

export class UrgentPriorityStrategy implements PriorityStrategy {
    isApplicable(category: string, description: string): boolean {
        return category === "infra" || description.toLowerCase().includes("urgente");
    }
    calculate(category: string, description: string): TicketPriority {
        return "urgent";
    }
}

export class BigDescriptionPriorityStrategy implements PriorityStrategy {
    isApplicable(category: string, description: string): boolean {
        return description.length > 500;
    }
    calculate(category: string, description: string): TicketPriority {
        return "high";
    }
}