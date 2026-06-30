import type { Database } from "../models/types";
import { toPublicUserDto } from "../dtos/userDto";

export interface UserRepository {
	readDatabase(): Database;
}

export function createUserService(repository: UserRepository) {
	function listUsers() {
		const database = repository.readDatabase();

		return database.users.map(toPublicUserDto);
	}

	return {
		listUsers,
	};
}
