import type { User } from "../types";

export type PublicUserDto = Omit<User, "password">;

export function toPublicUserDto(user: User): PublicUserDto {
	const { password, ...publicUser } = user;
	return publicUser;
}
