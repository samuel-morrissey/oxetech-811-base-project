export function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

enum Category {
  Infra = "infra",
  Sistemas = "sistemas",
  Academico = "academico",
}

enum TicketPriority {
  Urgent = "urgent",
  High = "high",
  Medium = "medium",
  Low = "low",
}

enum Description {
  DESCRIPTION_LENGTH_THRESHOLD = 220
}

export function calculatePriority(category: Category, description: string): TicketPriority {
  if (category === Category.Infra || description.toLowerCase().includes("urgente")) {
    return TicketPriority.Urgent;
  }

  if (category === Category.Sistemas || description.length > Description.DESCRIPTION_LENGTH_THRESHOLD) {
    return TicketPriority.High;
  }

  if (category === Category.Academico) {
    return TicketPriority.Medium;
  }

  return TicketPriority.Low;
}


