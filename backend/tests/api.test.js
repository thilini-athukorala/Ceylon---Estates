const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const app = require("../app");

let server;
let baseURL;

before(async () => {
    server = app.listen(0);

    await new Promise((resolve) => {
        server.once("listening", resolve);
    });

    const port = server.address().port;
    baseURL = `http://127.0.0.1:${port}`;
});

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
});

test("Property API health check", async () => {
    const response = await fetch(`${baseURL}/api/properties/test`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.message, "Property API is working!");
});

test("Reject invalid minimum price", async () => {
    const response = await fetch(
        `${baseURL}/api/properties?minPrice=-100`
    );

    assert.equal(response.status, 400);
});

test("Reject invalid maximum price", async () => {
    const response = await fetch(
        `${baseURL}/api/properties?maxPrice=abc`
    );

    assert.equal(response.status, 400);
});

test("Reject invalid property ID", async () => {
    const response = await fetch(
        `${baseURL}/api/properties/invalid-id`
    );

    assert.equal(response.status, 400);
});

test("Reject registration with missing fields", async () => {
    const response = await fetch(`${baseURL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "Test User",
            email: "test@example.com"
        })
    });

    const data = await response.json();

    assert.equal(response.status, 400);
    assert.equal(
        data.message,
        "Name, email and password are required"
    );
});
