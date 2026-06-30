import type { TicketPriority } from "../models/types";

const HIGH_PRIORITY_MIN_LENGTH = 220;

interface PriorityRule {
	matches(fields: PriorityFields): boolean;
	readonly priority: TicketPriority;
}

interface PriorityFields {
	category: string;
	description: string;
}

class UrgentPriorityRule implements PriorityRule {
	readonly priority: TicketPriority = "urgent";

	matches(fields: PriorityFields): boolean {
		return (
			fields.category === "infra" ||
			fields.description.toLowerCase().includes("urgente")
		);
	}
}

class HighPriorityRule implements PriorityRule {
	readonly priority: TicketPriority = "high";

	matches(fields: PriorityFields): boolean {
		return (
			fields.category === "sistemas" ||
			fields.description.length > HIGH_PRIORITY_MIN_LENGTH
		);
	}
}

class MediumPriorityRule implements PriorityRule {
	readonly priority: TicketPriority = "medium";

	matches(fields: PriorityFields): boolean {
		return fields.category === "academico";
	}
}

const priorityRules: PriorityRule[] = [
	new UrgentPriorityRule(),
	new HighPriorityRule(),
	new MediumPriorityRule(),
];

export function calculatePriority(
	category: string,
	description: string,
): TicketPriority {
	const matchedRule = priorityRules.find((rule) =>
		rule.matches({ category, description }),
	);

	return matchedRule?.priority ?? "low";
}
