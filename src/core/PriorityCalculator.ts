import { BigDescriptionPriorityStrategy, DefaultPriorityStrategy, HighPriorityStrategy, MediumPriorityStrategy, PriorityStrategy, UrgentPriorityStrategy } from "./PriorityStrategy";
import { TicketPriority } from "./Ticket";

export class PriorityCalculator {
    private static possibleStrategies: PriorityStrategy[] = [
        new UrgentPriorityStrategy(),
        new HighPriorityStrategy(),
        new MediumPriorityStrategy(),
        new BigDescriptionPriorityStrategy(),
        new DefaultPriorityStrategy()
    ];

    static calculate(category: string, description: string): TicketPriority {
        const strategy = this.possibleStrategies.find((strategy) => strategy.isApplicable(category, description));
        if (!strategy) {
            throw new Error("No applicable priority strategy found");
        }
        return strategy.calculate(category, description);
    }
}