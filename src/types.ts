export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type UserRole = "student" | "teacher" | "support";

// NOVO: categoria era "string" — qualquer valor era aceito sem aviso do compilador.
// Como union type, o TypeScript rejeita automaticamente valores fora desse conjunto.
export type TicketCategory = "infra" | "sistemas" | "academico";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

// NOVO: versão do usuário sem senha, para uso nas respostas HTTP.
// "Omit<User, 'password'>" significa: "o tipo User, exceto o campo password".
export type PublicUser = Omit<User, "password">;

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  // MUDOU: de "string" para "TicketCategory" — o compilador agora valida esse campo.
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  requesterId: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  users: User[];
  tickets: Ticket[];
  comments: TicketComment[];
}
