const { test } = require("node:test");
const assert = require("node:assert/strict");
const { can, requirePermission } = require("../config/rbac");

function run(role, permission) {
  const out = {};
  const res = { status(c) { out.code = c; return this; }, json() { return this; } };
  requirePermission(permission)({ user: role ? { role } : undefined }, res, () => { out.code = 200; });
  return out.code;
}

test("restricted modules return 403 for roles without the permission and 401 without a user", () => {
  for (const p of ["manage_hr", "view_hr", "manage_users", "view_ceo_oversight", "manage_ceo_oversight"]) {
    assert.equal(run("BSO", p), 403, `BSO ${p}`);
    assert.equal(run(undefined, p), 401, `anon ${p}`);
  }
});

test("allowed roles pass and a role claimed in the request is irrelevant", () => {
  assert.equal(run("System Admin", "manage_hr"), 200);
  assert.equal(run("HR Manager", "manage_hr"), 200);
  assert.equal(run("CEO", "view_ceo_oversight"), 200);
  assert.equal(run("CEO", "manage_hr"), 403);
  assert.equal(can({ role: "BSO", claimedRole: "System Admin" }, "manage_hr"), false);
});
