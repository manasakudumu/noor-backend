import { strict as assert } from "assert";
import dotenv from "dotenv";
import process from "process";
import sinon from "sinon"; // for mocking captcha verification
import type { SessionDoc } from "../server/concepts/sessioning";
import db, { client } from "../server/db";
import { app } from "../server/routes";

// Make sure we are in test mode
process.env.TEST = "true";

// Load the .env file
dotenv.config();

if (db.databaseName !== "test-db") {
  throw new Error("Not connected to test database");
}

// Mock session creation (used in test cases)
function getEmptySession() {
  return { cookie: {} } as SessionDoc;
}


// Drop the test database before each test
beforeEach(async () => {
  await db.dropDatabase();
  await app.createUser(getEmptySession(), "alice", "alice123", "mock-captcha-token");
  await app.createUser(getEmptySession(), "bob", "bob123", "mock-captcha-token");
});

// After all tests, restore the captcha verification and close the database
after(async () => {
  sinon.restore(); // Restore the original CAPTCHA verification method
  await client.close();
});

// Test cases
describe("Create a user and log in", () => {
  it("should create a user and log in", async () => {
    const session = getEmptySession();

    const created = await app.createUser(session, "barish", "1234", "mock-captcha-token");
    assert(created.user);

    // Test login failure (incorrect password)
    await assert.rejects(app.logIn(session, "barish", "123"));

    // Test login success
    await app.logIn(session, "barish", "1234");

    // Test double login should fail
    await assert.rejects(app.logIn(session, "barish", "1234"), "Should not be able to login while already logged in");
  });

  it("duplicate username should fail", async () => {
    const session = getEmptySession();

    const created = await app.createUser(session, "barish", "1234", "mock-captcha-token");
    assert(created.user);

    // Try to create a user with the same username
    await assert.rejects(app.createUser(session, "barish", "1234", "mock-captcha-token"));
  });

  it("get invalid username should fail", async () => {
    // Invalid username should fail
    await assert.rejects(app.getUser(""), "Username should be at least 1 character long");

    // Valid username should succeed
    await app.getUser("alice");
  });
});
