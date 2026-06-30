module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["<rootDir>/tests/**/*.test.ts"],
	collectCoverageFrom: [
		"src/**/*.ts",
		"!src/server.ts",
		"!src/seed.ts",
	],
	coverageDirectory: "coverage",
	clearMocks: true,
};
