import type { Repository } from "../../../domain/repository.js";
import type { TicketsRepository } from "../tickets.repository.js";
import type { User } from "../../users/types/user.js";
import type { Ticket } from "../types/ticket.js";

export function enrichTicketForList(
  ticketsRepository: TicketsRepository,
  usersRepository: Repository<User>,
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
  usersRepository: Repository<User>,
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
