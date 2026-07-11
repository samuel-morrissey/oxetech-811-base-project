import type { TicketPriority, TicketCategory } from "../types";

interface TicketPriorityPolice {
    isAplicable(category: TicketCategory, description: string): boolean;
    calculatePriority(): TicketPriority;

}

class UrgentTicketPolice implements TicketPriorityPolice {
    isAplicable(category: TicketCategory, description: string): boolean {
        return category === "infra" || description.toLowerCase().includes("urgente");
    }

    calculatePriority(): TicketPriority {
        return "urgent";
    }
}

class HighTicketPolice implements TicketPriorityPolice {
    isAplicable(category: TicketCategory, description: string): boolean {
        return category === "sistemas" || description.length > 220;
    }

    calculatePriority(): TicketPriority {
        return "high";
    }
}

class MediumTicketPolice implements TicketPriorityPolice {
    isAplicable(category: TicketCategory, description: string): boolean {
        return category === "academico";
    }

    calculatePriority(): TicketPriority {
        return "medium";
    }
}

class LowTicketPolice implements TicketPriorityPolice {
    isAplicable(category: TicketCategory, description: string): boolean {
        return true;
    }

    calculatePriority(): TicketPriority {
        return "low";
    }
}


export function calculateTicketPriority(category: TicketCategory, description: string): TicketPriority {
    const policies = [
        new UrgentTicketPolice(),
        new HighTicketPolice(),
        new MediumTicketPolice(),
        new LowTicketPolice(),
    ];

    const policy = policies.find((policy) =>
        policy.isAplicable(category, description)
    );

    return policy!.calculatePriority();

}




