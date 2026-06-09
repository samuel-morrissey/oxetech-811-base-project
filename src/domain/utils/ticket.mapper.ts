import type { Ticket, TicketComment, User } from "../types";

export function mapTicketDetails(
  ticket: Ticket,
  users: User[],
  comments: TicketComment[],
  includeFullComments = false,
) {
  const requester = users.find((user) => user.id === ticket.requesterId);
  const assigned = users.find((user) => user.id === ticket.assignedToId);
  const ticketComments = comments.filter((comment) => comment.ticketId === ticket.id);

  if (includeFullComments) {
    const commentsWithAuthor = ticketComments.map((comment) => ({
      ...comment,
      author: users.find((user) => user.id === comment.authorId),
    }));

    return {
      ...ticket,
      requester,
      assigned,
      comments: commentsWithAuthor,
    };
  }

  return {
    ...ticket,
    requester,
    assigned,
    commentsCount: ticketComments.length,
  };
}
