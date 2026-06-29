import type { Database, Ticket, TicketComment } from "../types";
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

export function toTicketListItemDto(
	ticket: Ticket,
	database: Database,
): TicketListItemDto {
	const requester = database.users.find((user) => user.id === ticket.requesterId);
	const assigned = database.users.find((user) => user.id === ticket.assignedToId);
	const commentsCount = database.comments.filter(
		(comment) => comment.ticketId === ticket.id,
	).length;

	return {
		...ticket,
		requester: requester ? toPublicUserDto(requester) : undefined,
		assigned: assigned ? toPublicUserDto(assigned) : undefined,
		commentsCount,
	};
}

export function toTicketDetailsDto(
	ticket: Ticket,
	database: Database,
): TicketDetailsDto {
	const requester = database.users.find((user) => user.id === ticket.requesterId);
	const assigned = database.users.find((user) => user.id === ticket.assignedToId);
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
		requester: requester ? toPublicUserDto(requester) : undefined,
		assigned: assigned ? toPublicUserDto(assigned) : undefined,
		comments,
	};
}
