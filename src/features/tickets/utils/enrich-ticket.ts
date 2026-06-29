import type { Repository } from "../../../domain/repository.js";
import { toPublicUser } from "../../users/dtos/public-user.dto.js";
import type { User } from "../../users/types/user.js";
import type { TicketsRepository } from "../tickets.repository.js";
import type { Ticket } from "../types/ticket.js";

function toPublicUserOrUndefined(user: User | undefined) {
  return user ? toPublicUser(user) : undefined;
}

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
    requester: toPublicUserOrUndefined(requester),
    assigned: toPublicUserOrUndefined(assigned),
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
      author: toPublicUserOrUndefined(
        usersRepository.findById(comment.authorId),
      ),
    }));

  return {
    ...ticket,
    requester: toPublicUserOrUndefined(requester),
    assigned: toPublicUserOrUndefined(assigned),
    comments,
  };
}
