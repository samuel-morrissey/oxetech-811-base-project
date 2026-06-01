import { findUserById } from "../../users/utils/find-user-by-id.js";
import type { Database } from "../../../utils/database-type.js";
import type { Ticket } from "../types/ticket.js";

export function enrichTicketForList(
  database: Database,
  ticket: Ticket,
) {
  const requester = findUserById(database, ticket.requesterId);
  const assigned = ticket.assignedToId
    ? findUserById(database, ticket.assignedToId)
    : undefined;
  const comments = database.comments.filter(
    (comment) => comment.ticketId === ticket.id,
  );

  return {
    ...ticket,
    requester,
    assigned,
    commentsCount: comments.length,
  };
}

export function enrichTicketWithComments(
  database: Database,
  ticket: Ticket,
) {
  const requester = findUserById(database, ticket.requesterId);
  const assigned = ticket.assignedToId
    ? findUserById(database, ticket.assignedToId)
    : undefined;
  const comments = database.comments
    .filter((comment) => comment.ticketId === ticket.id)
    .map((comment) => ({
      ...comment,
      author: findUserById(database, comment.authorId),
    }));

  return {
    ...ticket,
    requester,
    assigned,
    comments,
  };
}
