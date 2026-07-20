export interface UpdateTicketStatusDto {
  ticketId: string;
  status: string;
  comment?: string;
  authorId?: string;
}
