import { describe, expect, it } from "@jest/globals";
import { toPublicUserDto } from "../../../src/dtos/userDto";
import type { User } from "../../../src/models/types";

describe("toPublicUserDto", () => {
	it("removes password hash from user response", () => {
		const user: User = {
			id: "user_1",
			name: "Ana",
			email: "ana@example.com",
			role: "student",
			passwordHash: "hashed-secret",
		};

		const dto = toPublicUserDto(user);

		expect(dto).toEqual({
			id: "user_1",
			name: "Ana",
			email: "ana@example.com",
			role: "student",
		});
		expect("passwordHash" in dto).toBe(false);
	});
});
