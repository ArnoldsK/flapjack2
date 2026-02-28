/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/shared", "<rootDir>/app/src"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "^@app/(.*)$": "<rootDir>/app/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/web/"],
  rootDir: ".",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.base.json" }],
  },
};
