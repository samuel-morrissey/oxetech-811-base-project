export interface CreateTicketDto {
  title: string;
  description: string;
  category: string;
  requesterId: string;
  assignedToId?: string;
}
