import type { TicketPriority, Category } from "./types";

interface TicketPriorityPolice {
    calculatePriority(
        category: Category,
        description: string
    ): TicketPriority | undefined;
}

class urgentTicketPolice implements TicketPriorityPolice {
    calculatePriority(category: Category, description: string): TicketPriority | undefined {
        if (category === "infra" || description.toLowerCase().includes("urgente")) {
            return "urgent";
        }
        return undefined;
    }
}

class highTicketPolice implements TicketPriorityPolice {
    calculatePriority(category: Category, description: string): TicketPriority | undefined {
        if (category === "sistemas" || description.length > 220) {
            return "high";
        }
        return undefined;
    }
}

class mediumTicketPolice implements TicketPriorityPolice {
    calculatePriority(category: Category, description: string): TicketPriority | undefined {
        if (category === "academico") {
            return "medium";
        }
        return undefined;
    }
}

class lowTicketPolice implements TicketPriorityPolice {
    calculatePriority(category: Category, description: string): TicketPriority | undefined {
        if (description.length < 20) {
            return "low";
        }
        return undefined;
    }
}


export function calculateTicketPriority(category: Category, description: string): TicketPriority | undefined {
    const policies = [
        new urgentTicketPolice(),
        new highTicketPolice(),
        new mediumTicketPolice(),
        new lowTicketPolice(),
    ];

    for (const policy of policies) {
        const priority = policy.calculatePriority(category, description);

        if (priority !== undefined) {
            return priority;
        }
    }

}


