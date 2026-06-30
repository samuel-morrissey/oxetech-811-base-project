import type { User } from "../models/types";

export type PublicUserDto = Omit<User, "passwordHash">;

export function toPublicUserDto(user: User): PublicUserDto {
	const { passwordHash, ...publicUser } = user;
	return publicUser;
}
