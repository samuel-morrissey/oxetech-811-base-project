import type { UsersRepository } from "../../users/users.repository.js";
import type { Ticket } from "../types/ticket.js";
import type { TicketsRepository } from "../tickets.repository.js";

export function enrichTicketForList(
  ticketsRepository: TicketsRepository,
  usersRepository: UsersRepository,
  ticket: Ticket,
) {
  const requester = usersRepository.findById(ticket.requesterId);
  const assigned = ticket.assignedToId
    ? usersRepository.findById(ticket.assignedToId)
    : undefined;
  const comments = ticketsRepository.findCommentsByTicketId(
    ticket.id,
  );

  return {
    ...ticket,
    requester,
    assigned,
    commentsCount: comments.length,
  };
}

export function enrichTicketWithComments(
  ticketsRepository: TicketsRepository,
  usersRepository: UsersRepository,
  ticket: Ticket,
) {
  const requester = usersRepository.findById(ticket.requesterId);
  const assigned = ticket.assignedToId
    ? usersRepository.findById(ticket.assignedToId)
    : undefined;
  const comments = ticketsRepository
    .findCommentsByTicketId(ticket.id)
    .map((comment) => ({
      ...comment,
      author: usersRepository.findById(comment.authorId),
    }));

  return {
    ...ticket,
    requester,
    assigned,
    comments,
  };
}
