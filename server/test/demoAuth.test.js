const { test } = require("node:test");
const assert = require("node:assert/strict");
const { demoSession } = require("../controllers/authController");
const { demoAuthEnabled, assertDeployableConfig, resolveAppEnv } = require("../config/env");

function call(env, body) {
  const saved = { NODE_ENV: process.env.NODE_ENV, ENABLE_DEMO_AUTH: process.env.ENABLE_DEMO_AUTH };
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return new Promise((resolve, reject) => {
    const res = {
      status(code) { this.code = code; return this; },
      json(payload) { resolve({ code: this.code || 200, payload }); },
    };
    demoSession({ body }, res, reject);
  }).finally(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test("demo sign-in bridge is off by default and never active in production", async () => {
  const body = { role: "BSO", name: "Neha Jain" };
  assert.equal((await call({ ENABLE_DEMO_AUTH: undefined, NODE_ENV: "development" }, body)).code, 404);
  assert.equal((await call({ ENABLE_DEMO_AUTH: "false", NODE_ENV: "development" }, body)).code, 404);
  assert.equal((await call({ ENABLE_DEMO_AUTH: "true", APP_ENV: "production", NODE_ENV: "production" }, body)).code, 404);
  assert.equal((await call({ ENABLE_DEMO_AUTH: "true", APP_ENV: undefined, NODE_ENV: "production" }, body)).code, 404);
});

test("demo sign-in bridge rejects unknown roles when enabled", async () => {
  const result = await call({ ENABLE_DEMO_AUTH: "true", APP_ENV: "demo", NODE_ENV: "production" }, { role: "hacker", name: "x" });
  assert.equal(result.code, 403);
});

test("demo auth is explicit: works for APP_ENV=demo even when NODE_ENV=production, never for production", () => {
  assert.equal(demoAuthEnabled({ APP_ENV: "demo", NODE_ENV: "production", ENABLE_DEMO_AUTH: "true" }), true);
  assert.equal(demoAuthEnabled({ APP_ENV: "demo", NODE_ENV: "production" }), false);
  assert.equal(demoAuthEnabled({ APP_ENV: "production", ENABLE_DEMO_AUTH: "true" }), false);
  assert.equal(demoAuthEnabled({ NODE_ENV: "production", ENABLE_DEMO_AUTH: "true" }), false);
  assert.equal(resolveAppEnv({ NODE_ENV: "production" }), "production");
});

test("deployed profiles refuse unsafe or incomplete configuration", () => {
  const good = { APP_ENV: "demo", ENABLE_DEMO_AUTH: "true", JWT_SECRET: "x".repeat(40), MONGO_URI: "mongodb://h/db", CLIENT_ORIGIN: "https://demo.example.com" };
  assert.deepEqual(assertDeployableConfig(good), []);
  assert.equal(assertDeployableConfig({ ...good, JWT_SECRET: "short" }).length, 1);
  assert.equal(assertDeployableConfig({ ...good, MONGO_URI: "" }).length, 1);
  assert.equal(assertDeployableConfig({ ...good, CLIENT_ORIGIN: "" }).length, 1);
  assert.deepEqual(assertDeployableConfig({ ...good, CLIENT_ORIGIN: "", SERVE_CLIENT: "true" }), []);
  assert.equal(assertDeployableConfig({ ...good, APP_ENV: "production" }).length, 1);
  assert.deepEqual(assertDeployableConfig({}), []);
});

test("demo sign-in issues a session for every login-selector role and rejects unknown ones", async () => {
  const { DEMO_ROLES } = require("../config/rbac");
  assert.equal(DEMO_ROLES.length, 38);
  for (const role of ["CEO", "System Admin", "HR Manager", "Credit Head", "Audit Manager", "BSO", "Central Operations", "Accountant", "Finance Manager", "CFO"]) {
    assert.ok(DEMO_ROLES.includes(role), role);
  }
  const env = { ENABLE_DEMO_AUTH: "true", APP_ENV: "demo", NODE_ENV: "production" };
  for (const role of ["hacker", "Super Hacker", ""]) assert.ok([400, 403].includes((await call(env, { role, name: "x" })).code), role);
  assert.equal((await call(env, { role: "BSO", name: "" })).code, 400);
});

test("General Ledger separates finance maker, checker and close permissions", () => {
  const { ROLES } = require("../config/gl");
  assert.ok(ROLES.maker.includes("Accountant"));
  assert.ok(ROLES.master.includes("Finance Manager"));
  assert.ok(ROLES.checker.includes("Finance Manager"));
  assert.ok(ROLES.checker.includes("CFO"));
  assert.ok(ROLES.close.includes("CFO"));
  assert.ok(!ROLES.master.includes("Accountant"));
  assert.ok(!ROLES.maker.includes("Finance Manager"));
  assert.ok(!ROLES.maker.includes("CFO"));
});
