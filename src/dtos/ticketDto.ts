import type { Database, Ticket, TicketComment } from "../models/types";
import { toPublicUserDto, type PublicUserDto } from "./userDto";

type TicketWithRelationsDto = Ticket & {
	requester?: PublicUserDto;
	assigned?: PublicUserDto;
};

export type TicketListItemDto = TicketWithRelationsDto & {
	commentsCount: number;
};

export type TicketCommentDto = TicketComment & {
	author?: PublicUserDto;
};

export type TicketDetailsDto = TicketWithRelationsDto & {
	comments: TicketCommentDto[];
};

function getTicketUsers(ticket: Ticket, database: Database) {
	const requester = database.users.find((user) => user.id === ticket.requesterId);
	const assigned = database.users.find((user) => user.id === ticket.assignedToId);

	return {
		requester: requester ? toPublicUserDto(requester) : undefined,
		assigned: assigned ? toPublicUserDto(assigned) : undefined,
	};
}

export function toTicketListItemDto(
	ticket: Ticket,
	database: Database,
): TicketListItemDto {
	const { requester, assigned } = getTicketUsers(ticket, database);
	const commentsCount = database.comments.filter(
		(comment) => comment.ticketId === ticket.id,
	).length;

	return {
		...ticket,
		requester,
		assigned,
		commentsCount,
	};
}

export function toTicketDetailsDto(
	ticket: Ticket,
	database: Database,
): TicketDetailsDto {
	const { requester, assigned } = getTicketUsers(ticket, database);
	const comments = database.comments
		.filter((comment) => comment.ticketId === ticket.id)
		.map((comment) => {
			const author = database.users.find((user) => user.id === comment.authorId);

			return {
				...comment,
				author: author ? toPublicUserDto(author) : undefined,
			};
		});

	return {
		...ticket,
		requester,
		assigned,
		comments,
	};
}
