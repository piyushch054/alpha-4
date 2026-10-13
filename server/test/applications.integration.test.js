const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Application = require("../models/Application");
const User = require("../models/User");

const original = {
  find: Application.find,
  findOne: Application.findOne,
  findById: Application.findById,
  findOneAndUpdate: Application.findOneAndUpdate,
  create: Application.create,
  findUserById: User.findById,
};

function valueAt(record, path) {
  return path.split(".").reduce((value, key) => value?.[key], record);
}

function matches(record, query) {
  return Object.entries(query).every(
    ([key, expected]) => String(valueAt(record, key)) === String(expected),
  );
}

function setValue(record, path, value) {
  const parts = path.split(".");
  const key = parts.pop();
  const parent = parts.reduce((target, part) => (target[part] ||= {}), record);
  parent[key] = value;
}

function installRepository(records) {
  Application.find = (query) => ({
    sort() {
      return this;
    },
    async limit(limit) {
      return [...records.values()]
        .filter((record) => matches(record, query))
        .slice(0, limit);
    },
  });
  Application.findOne = async (query) =>
    [...records.values()].find((record) => matches(record, query)) || null;
  Application.findById = async (id) => records.get(String(id)) || null;
  Application.create = async (fields) => {
    if (records.has(String(fields._id))) {
      const error = new Error("duplicate");
      error.code = 11000;
      throw error;
    }
    const record = {
      ...fields,
      id: String(fields._id),
      __v: 0,
      cam: { status: "Not Sent" },
      bureau: { status: "Not Requested" },
      pdHistory: [],
      audit: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    records.set(record.id, record);
    return record;
  };
  Application.findOneAndUpdate = async (query, update) => {
    const record = [...records.values()].find((candidate) =>
      matches(candidate, query),
    );
    if (!record) return null;
    for (const [path, value] of Object.entries(update.$set || {}))
      setValue(record, path, value);
    for (const [path, value] of Object.entries(update.$inc || {}))
      setValue(record, path, Number(valueAt(record, path) || 0) + value);
    for (const [path, value] of Object.entries(update.$push || {})) {
      const list = valueAt(record, path) || [];
      list.push(value);
      setValue(record, path, list);
    }
    record.updatedAt = new Date();
    return record;
  };
}

function token(user) {
  return jwt.sign({ id: user._id, role: user.role }, "supersecret", {
    expiresIn: "5m",
  });
}

test("authenticated PD API persists, reloads, updates, routes, and deduplicates a real case ID", async (t) => {
  const users = {
    bso: {
      _id: new mongoose.Types.ObjectId(),
      name: "Authenticated BSO",
      email: "bso@example.com",
      role: "BSO",
    },
    other: {
      _id: new mongoose.Types.ObjectId(),
      name: "Other BSO",
      email: "other@example.com",
      role: "BSO",
    },
    credit: {
      _id: new mongoose.Types.ObjectId(),
      name: "Branch Credit",
      email: "credit@example.com",
      role: "BCM",
    },
    bdm: {
      _id: new mongoose.Types.ObjectId(),
      name: "Branch BDM",
      email: "bdm@example.com",
      role: "BDM",
    },
    blocked: {
      _id: new mongoose.Types.ObjectId(),
      name: "Basic User",
      email: "user@example.com",
      role: "user",
    },
  };
  const usersById = new Map(
    Object.values(users).map((user) => [String(user._id), user]),
  );
  User.findById = (id) => ({
    select: async () => usersById.get(String(id)) || null,
  });

  const records = new Map();
  installRepository(records);
  const routerPath = require.resolve("../routes/applications");
  delete require.cache[routerPath];
  const router = require("../routes/applications");
  const app = express();
  app.use("/api/applications", router);
  t.after(() => {
    Object.assign(Application, {
      find: original.find,
      findOne: original.findOne,
      findById: original.findById,
      findOneAndUpdate: original.findOneAndUpdate,
      create: original.create,
    });
    User.findById = original.findUserById;
    delete require.cache[routerPath];
  });

  const invoke = (url, method, headers, body) =>
    new Promise((resolve, reject) => {
      const req = Object.assign(Object.create(app.request), {
        method,
        url,
        originalUrl: url,
        headers,
        connection: {},
        socket: {},
        body,
      });
      const responseHeaders = {};
      let output = "";
      const res = Object.assign(Object.create(app.response), {
        req,
        app,
        statusCode: 200,
        setHeader(name, value) {
          responseHeaders[name.toLowerCase()] = value;
        },
        getHeader(name) {
          return responseHeaders[name.toLowerCase()];
        },
        getHeaders() {
          return responseHeaders;
        },
        removeHeader(name) {
          delete responseHeaders[name.toLowerCase()];
        },
        write(chunk) {
          output += chunk || "";
          return true;
        },
        end(chunk) {
          output += chunk || "";
          resolve({
            status: this.statusCode,
            json: output ? JSON.parse(output) : null,
          });
        },
      });
      req.res = res;
      app.handle(req, res, reject);
    });

  const base = "/api/applications";
  const request = async (path, user, options = {}) => {
    const body =
      typeof options.body === "string"
        ? JSON.parse(options.body)
        : options.body || {};
    const result = await invoke(
      base + path,
      options.method || "GET",
      {
        authorization: `Bearer ${token(user)}`,
        "content-type": "application/json",
        ...options.headers,
      },
      body,
    );
    return { response: { status: result.status }, json: result.json };
  };

  const caseId = "LOS-E2E-001";
  const evidence = {
    geotag: {
      latitude: 26.9124,
      longitude: 75.7873,
      accuracy: 15,
      capturedAt: "2026-10-08T05:05:00.000Z",
      status: "Captured",
    },
    picture: {
      dataUrl: "data:image/png;base64,iVBORw0KGgo=",
      capturedAt: "2026-10-08T05:06:00.000Z",
      status: "Captured",
      confirmed: true,
      source: "camera",
      mimeType: "image/png",
    },
  };
  const draft = await request(`/${caseId}/draft`, users.bso, {
    method: "PUT",
    body: JSON.stringify({
      leadId: "CRM-TEST-001",
      customerId: "CUS-TEST-001",
      scheme: "MSME Standard",
      customer: "Test Applicant",
      mobile: "9876543210",
      product: "MSME",
      branch: "Jaipur",
      amount: 500000,
      draft: { data: { tenure: 36 }, step: 5 },
    }),
  });
  assert.equal(draft.response.status, 200);
  assert.equal(draft.json.data._id, caseId);

  const followedUp = await request(`/${caseId}/pd`, users.bso, {
    method: "PUT",
    body: JSON.stringify({
      code: "PD-E2E-001",
      type: "Business PD",
      meetingAt: "2026-10-08T05:00:00.000Z",
      personMet: "Applicant",
      location: "Business premises",
      remarks: "Income and activity reviewed",
      followUpRequired: true,
      followUp: {
        at: "2026-10-09T05:00:00.000Z",
        person: "Applicant",
        location: "Branch",
        remarks: "Collect final statement",
      },
      status: "Hold",
      revision: 0,
      ...evidence,
      applicationId: "FORGED",
      customerId: "FORGED",
      doneBy: "forged",
      doneByName: "Forged User",
    }),
  });
  assert.equal(followedUp.response.status, 200);
  assert.equal(followedUp.json.data.pd.doneByName, users.bso.name);
  assert.equal(followedUp.json.data.pd.followUp.person, "Applicant");
  assert.equal(followedUp.json.data.pd.applicationId, caseId);
  assert.equal(followedUp.json.data.pd.customerId, "CUS-TEST-001");
  assert.equal(followedUp.json.data.pdHistory.length, 1);

  const reloaded = await request(`/${caseId}/pd`, users.bso);
  assert.equal(reloaded.response.status, 200);
  assert.equal(reloaded.json.data.pd.revision, 1);

  const updated = await request(`/${caseId}/pd`, users.bso, {
    method: "PUT",
    body: JSON.stringify({
      code: "PD-E2E-002",
      type: "Business PD",
      meetingAt: "2026-10-08T05:00:00.000Z",
      personMet: "Applicant",
      location: "Business premises",
      remarks: "Follow-up completed and field visit recommended",
      followUpRequired: false,
      followUp: { person: "stale" },
      status: "Recommended",
      revision: 1,
      ...evidence,
    }),
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.json.data.pd.revision, 2);
  assert.equal(updated.json.data.pd.recordId, followedUp.json.data.pd.recordId);
  assert.equal(updated.json.data.pdVerification.status, "Verification Pending");
  assert.equal(updated.json.data.pd.followUp, undefined);
  assert.equal(updated.json.data.pdHistory.length, 2);
  assert.equal(updated.json.data.pdHistory[0].code, "PD-E2E-001");
  assert.equal(updated.json.data.pdHistory[1].code, "PD-E2E-002");
  const duplicateSave = await request(`/${caseId}/pd`, users.bso, {
    method: "PUT",
    body: JSON.stringify(updated.json.data.pd),
  });
  assert.equal(duplicateSave.response.status, 200);
  assert.equal(duplicateSave.json.data.pd.revision, 2);
  assert.equal(duplicateSave.json.data.pdHistory.length, 2);

  const staleSave = await request(`/${caseId}/pd`, users.bso, {
    method: "PUT",
    body: JSON.stringify({
      code: "PD-STALE",
      type: "Business PD",
      meetingAt: "2026-10-08T05:00:00.000Z",
      personMet: "Applicant",
      location: "Branch",
      remarks: "Stale browser tab attempt",
      followUpRequired: false,
      status: "Recommended",
      revision: 1,
      ...evidence,
    }),
  });
  assert.equal(staleSave.response.status, 409);

  const otherOwner = await request(`/${caseId}/pd`, users.other);
  assert.equal(otherOwner.response.status, 404);
  const blocked = await request(`/${caseId}/pd`, users.blocked);
  assert.equal(blocked.response.status, 403);

  const premature = await request(`/${caseId}/send-to-cam`, users.bso, {
    method: "POST",
    body: JSON.stringify({ revision: 2 }),
  });
  assert.equal(premature.response.status, 409);
  const unauthorizedVerify = await request(
    `/${caseId}/verify-pd`,
    users.blocked,
    { method: "POST", body: JSON.stringify({ revision: 2 }) },
  );
  assert.equal(unauthorizedVerify.response.status, 403);
  const staleVerify = await request(`/${caseId}/verify-pd`, users.bso, {
    method: "POST",
    body: JSON.stringify({ revision: 1 }),
  });
  assert.equal(staleVerify.response.status, 409);
  const verified = await request(`/${caseId}/verify-pd`, users.bso, {
    method: "POST",
    body: JSON.stringify({ revision: 2 }),
  });
  assert.equal(verified.response.status, 200);
  assert.equal(verified.json.data.pdVerification.status, "Verified");
  const sent = await request(`/${caseId}/send-to-cam`, users.bso, {
    method: "POST",
    body: JSON.stringify({ revision: 2 }),
  });
  assert.equal(sent.response.status, 200);
  assert.equal(sent.json.data.cam.status, "Pending");
  const auditAfterSend = sent.json.data.audit.length;

  const duplicateSend = await request(`/${caseId}/send-to-cam`, users.bso, {
    method: "POST",
    body: JSON.stringify({ revision: 2 }),
  });
  assert.equal(duplicateSend.response.status, 200);
  assert.equal(duplicateSend.json.data.audit.length, auditAfterSend);

  const creditQueue = await request("", users.credit);
  assert.equal(creditQueue.response.status, 200);
  assert.deepEqual(
    creditQueue.json.data.map((record) => record._id),
    [caseId],
  );

  const bureau = await request(`/${caseId}/bureau-check`, users.credit, {
    method: "POST",
    body: "{}",
  });
  assert.equal(bureau.response.status, 200);
  assert.equal(bureau.json.data.bureau.status, "Pending Integration");
  assert.equal(bureau.json.data.bureau.requestId, `BUREAU-${caseId}`);
  const auditAfterBureau = bureau.json.data.audit.length;

  const duplicateBureau = await request(
    `/${caseId}/bureau-check`,
    users.credit,
    { method: "POST", body: "{}" },
  );
  assert.equal(duplicateBureau.response.status, 200);
  assert.equal(duplicateBureau.json.data.audit.length, auditAfterBureau);

  const secondId = "LOS-E2E-002";
  const secondDraft = await request(`/${secondId}/draft`, users.bso, {
    method: "PUT",
    body: JSON.stringify({
      leadId: "CRM-TEST-002",
      customerId: "CUS-TEST-002",
      scheme: "Two Wheeler Standard",
      customer: "Second Applicant",
      mobile: "9123456780",
      product: "Two Wheeler",
      branch: "Kota",
      amount: 125000,
      draft: { data: { tenure: 24 }, step: 5 },
    }),
  });
  assert.equal(secondDraft.response.status, 200);
  const secondPD = await request(`/${secondId}/pd`, users.bso, {
    method: "PUT",
    body: JSON.stringify({
      code: "PD-SECOND-001",
      type: "Asset PD",
      meetingAt: "2026-10-08T07:00:00.000Z",
      personMet: "Second Applicant",
      location: "Residence",
      remarks: "Second customer visit completed independently",
      followUpRequired: false,
      status: "Completed",
      revision: 0,
      ...evidence,
    }),
  });
  assert.equal(secondPD.response.status, 200);
  assert.equal(secondPD.json.data.pd.applicationId, secondId);
  assert.equal(secondPD.json.data.pd.customerId, "CUS-TEST-002");
  assert.equal(secondPD.json.data.pdHistory.length, 1);
  assert.notEqual(secondPD.json.data.pd.code, updated.json.data.pd.code);

  const prematureImd = await request(`/${secondId}/send-to-imd`, users.bso, {
    method: "POST",
    body: JSON.stringify({ pdDemoBypass: true }),
  });
  assert.equal(prematureImd.response.status, 409);
  const secondVerified = await request(`/${secondId}/verify-pd`, users.bso, {
    method: "POST",
    body: JSON.stringify({ revision: 1 }),
  });
  assert.equal(secondVerified.response.status, 200);
  const handedOff = await request(`/${secondId}/send-to-imd`, users.bso, {
    method: "POST",
    body: "{}",
  });
  assert.equal(handedOff.response.status, 200);
  assert.equal(handedOff.json.data.status, "IMD Pending");
  assert.equal(handedOff.json.data.workflowOwnerRole, "BDM");
  assert.equal(handedOff.json.data.imd.status, "Pending");

  const bdmQueue = await request("/imd-queue", users.bdm);
  assert.equal(bdmQueue.response.status, 200);
  assert.deepEqual(
    bdmQueue.json.data.map((record) => record._id),
    [secondId],
  );
  const submitReference = await request(`/${secondId}/imd-reference`, users.bdm, {
    method: "POST",
    body: JSON.stringify({ reference: "SIM-IMD-WRONG", amount: 1500 }),
  });
  assert.equal(submitReference.response.status, 200);
  assert.equal(submitReference.json.data.imd.status, "Submitted");
  const mismatch = await request(`/${secondId}/verify-imd`, users.bdm, {
    method: "POST",
    body: "{}",
  });
  assert.equal(mismatch.response.status, 200);
  assert.equal(mismatch.json.data.imd.status, "Mismatch");

  const correctedReference = await request(
    `/${secondId}/imd-reference`,
    users.bdm,
    {
      method: "POST",
      body: JSON.stringify({
        reference: handedOff.json.data.imd.simulatorReference,
        amount: 1500,
      }),
    },
  );
  assert.equal(correctedReference.response.status, 200);
  const verifiedImd = await request(`/${secondId}/verify-imd`, users.bdm, {
    method: "POST",
    body: "{}",
  });
  assert.equal(verifiedImd.response.status, 200);
  assert.equal(verifiedImd.json.data.imd.status, "Verified");
  const sentToCredit = await request(`/${secondId}/send-to-credit`, users.bdm, {
    method: "POST",
    body: "{}",
  });
  assert.equal(sentToCredit.response.status, 200);
  assert.equal(sentToCredit.json.data.status, "Credit Review");
  assert.equal(sentToCredit.json.data.workflowOwnerRole, "BCM");
  records.get(secondId).imd.status = "Pending";
  const returnedToImd = await request(`/${secondId}/return-to-imd`, users.bdm, {
    method: "POST",
    body: "{}",
  });
  assert.equal(returnedToImd.response.status, 200);
  assert.equal(returnedToImd.json.data.status, "IMD Pending");
  assert.equal(returnedToImd.json.data.workflowOwnerRole, "BDM");
  assert.equal(returnedToImd.json.data.imd.status, "Pending");
  const resubmittedReference = await request(
    `/${secondId}/imd-reference`,
    users.bdm,
    {
      method: "POST",
      body: JSON.stringify({
        reference: returnedToImd.json.data.imd.simulatorReference,
        amount: returnedToImd.json.data.imd.amount,
      }),
    },
  );
  assert.equal(resubmittedReference.response.status, 200);
  const reverifiedImd = await request(`/${secondId}/verify-imd`, users.bdm, {
    method: "POST",
    body: "{}",
  });
  assert.equal(reverifiedImd.response.status, 200);
  assert.equal(reverifiedImd.json.data.imd.status, "Verified");
  const resentToCredit = await request(`/${secondId}/send-to-credit`, users.bdm, {
    method: "POST",
    body: "{}",
  });
  assert.equal(resentToCredit.response.status, 200);
  assert.equal(resentToCredit.json.data.status, "Credit Review");
  const unauthorizedReturn = await request(
    `/${secondId}/return-to-imd`,
    users.bso,
    { method: "POST", body: "{}" },
  );
  assert.equal(unauthorizedReturn.response.status, 403);
  records.get(secondId).status = "Sanctioned";
  const returnAfterSanction = await request(
    `/${secondId}/return-to-imd`,
    users.bdm,
    { method: "POST", body: "{}" },
  );
  assert.equal(returnAfterSanction.response.status, 409);

  const firstAfterSecond = await request(`/${caseId}/pd`, users.bso);
  assert.equal(firstAfterSecond.json.data.pdHistory.length, 2);
  assert.equal(firstAfterSecond.json.data.pd.customerId, "CUS-TEST-001");

  const bypassId = "LOS-DEMO-PD-BYPASS-003";
  const bypassDraft = await request(`/${bypassId}/draft`, users.bso, {
    method: "PUT",
    body: JSON.stringify({
      leadId: "CRM-DEMO-003",
      customerId: "CUS-DEMO-003",
      scheme: "Tractor Loan Standard",
      customer: "Synthetic Tractor Demo",
      mobile: "9000013003",
      product: "Tractor Loan",
      branch: "Jaipur",
      amount: 850000,
      draft: { data: {}, step: 9, pdDemoBypass: true },
    }),
  });
  assert.equal(bypassDraft.response.status, 200);
  const demoBypassHandoff = await request(
    `/${bypassId}/send-to-imd`,
    users.bso,
    { method: "POST", body: "{}" },
  );
  assert.equal(demoBypassHandoff.response.status, 200);
  assert.equal(demoBypassHandoff.json.data.status, "IMD Pending");
  assert.equal(demoBypassHandoff.json.data.pd, undefined);
  assert.equal(demoBypassHandoff.json.data.pdVerification, undefined);
  assert.equal(demoBypassHandoff.json.data.pdDemoBypass.enabled, true);
  assert.match(
    demoBypassHandoff.json.data.audit.at(-1).details,
    /PD not performed; no visit, photo, geotag/,
  );
});
