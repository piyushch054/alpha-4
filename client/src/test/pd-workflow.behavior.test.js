// @vitest-environment jsdom

import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeWorkflowPDScript } from "@/lib/workflow-pd";

const clone = (value) => JSON.parse(JSON.stringify(value));
const flush = async () => {
  for (let index = 0; index < 8; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

const APPLICATIONS = [
  {
    id: "LOS-A-001",
    customer: "Asha Enterprises",
    mobile: "9876543210",
    product: "MSME",
    amount: 500000,
    branch: "Jaipur",
    scheme: "MSME Pragati",
    created: "08/10/2026",
    status: "Sales/Predeal",
    lifecycleManaged: true,
    lifecycle: { leadId: "LEAD-A-101", customerId: "CUS-A-201" },
    workflow: { dealId: "DEAL-A-301", ownerRole: "BSO" },
  },
  {
    id: "LOS-B-002",
    customer: "Bharat Auto Works",
    mobile: "9876501234",
    product: "MSME",
    amount: 750000,
    branch: "Ajmer",
    scheme: "MSME Udaan",
    created: "08/10/2026",
    status: "Sales/Predeal",
    lifecycleManaged: true,
    lifecycle: { leadId: "LEAD-B-102", customerId: "CUS-B-202" },
    workflow: { dealId: "DEAL-B-302", ownerRole: "BSO" },
  },
];

const makeRecord = (app) => ({
  _id: app.id,
  __v: 0,
  leadId: app.lifecycle.leadId,
  customerId: app.lifecycle.customerId,
  customer: app.customer,
  mobile: app.mobile,
  product: app.product,
  branch: app.branch,
  scheme: app.scheme,
  amount: app.amount,
  status: app.status,
  draft: { data: {}, docs: {}, step: 5, coType: "Co-applicant" },
  pdHistory: [],
  cam: { status: "Not Sent" },
  bureau: { status: "Not Requested" },
});

const activeDoms = [];

function createHarness({ local = false, storage = {} } = {}) {
  const dom = new JSDOM('<main class="los-application"></main>', {
    runScripts: "outside-only",
    url: "http://localhost/workspace",
  });
  activeDoms.push(dom);
  const win = dom.window;
  for (const [key, value] of Object.entries(storage)) win.localStorage.setItem(key, value);
  if (!local) win.localStorage.setItem("token", "test-employee-session-token");
  const records = new Map(APPLICATIONS.map((app) => [app.id, makeRecord(app)]));
  const requests = [];
  const pdWrites = new Map(APPLICATIONS.map((app) => [app.id, 0]));
  let geoMode = "success";

  const respond = (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () =>
      status >= 200 && status < 300
        ? { success: true, data: clone(data) }
        : { success: false, message: data },
  });

  win.fetch = vi.fn(async (url, options = {}) => {
    const path = String(url).replace("/api", "");
    const method = (options.method || "GET").toUpperCase();
    if (path === "/auth/demo-session") return respond("Not found", 404);
    requests.push({ path, method, headers: options.headers, body: options.body });
    const match = path.match(
      /^\/applications\/([^/]+)\/(pd|draft|verify-pd|send-to-cam|bureau-check)$/,
    );
    if (!match) return respond("Unexpected request", 500);

    const id = decodeURIComponent(match[1]);
    const action = match[2];
    const current = records.get(id);
    if (!current) return respond("Application not found", 404);

    if (action === "pd" && method === "GET") return respond(current);
    if (action === "verify-pd") {
      current.pdVerification = { status: "Verified", revision: current.pd.revision };
      return respond(current);
    }
    if (action === "draft" && method === "PUT") {
      const body = JSON.parse(options.body);
      const saved = {
        ...current,
        __v: current.__v + 1,
        leadId: body.leadId,
        customerId: body.customerId,
        scheme: body.scheme,
        draft: body.draft,
      };
      records.set(id, saved);
      return respond(saved);
    }
    if (action === "pd" && method === "PUT") {
      const body = JSON.parse(options.body);
      const revision = (current.pd?.revision || 0) + 1;
      const now = new Date().toISOString();
      const pd = {
        ...body,
        recordId: `PDREC-${id}-${revision}`,
        applicationId: id,
        leadId: current.leadId,
        customerId: current.customerId,
        product: current.product,
        followUp: body.followUpRequired ? body.followUp : undefined,
        doneBy: "session-bso-neha-jain",
        doneByName: "Neha Jain",
        doneByRole: "BSO",
        revision,
        createdAt: current.pd?.createdAt || now,
        updatedAt: now,
      };
      const saved = {
        ...current,
        __v: current.__v + 1,
        pd,
        pdHistory: [...current.pdHistory, pd],
      };
      records.set(id, saved);
      pdWrites.set(id, pdWrites.get(id) + 1);
      return respond(saved);
    }
    if (action === "send-to-cam" && method === "POST") {
      const saved = {
        ...current,
        __v: current.__v + 1,
        status: "CAM Allocation",
        cam: {
          status: "Pending",
          stage: "CAM Allocation",
          pdRevision: current.pd.revision,
        },
        bureau: { status: "Not Requested" },
      };
      records.set(id, saved);
      return respond(saved);
    }
    if (action === "bureau-check" && method === "POST") {
      const saved = {
        ...current,
        __v: current.__v + 1,
        bureau: {
          status: "Pending Integration",
          requestId: `BUREAU-${id}`,
        },
      };
      records.set(id, saved);
      return respond(saved);
    }
    return respond("Unexpected request", 500);
  });

  Object.assign(win, {
    applications: clone(APPLICATIONS).map((app) => ({ ...app, serverPersisted: !local })),
    wizard: {
      step: 5,
      product: "MSME",
      selectedApplicationId: "LOS-A-001",
      data: {},
      docs: {},
      coType: "Co-applicant",
    },
    currentUser: { role: "BSO", name: "Neha Jain" },
    namdevSession: {
      read: () => ({
        authenticated: true,
        role: "BSO",
        name: "Neha Jain",
        email: "neha.jain@namdev.local",
      }),
    },
    losEscapeHtml: (value) =>
      String(value ?? "").replace(
        /[&<>"']/g,
        (character) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[character],
      ),
    wizardHeader: (title) => `<header><h3>${title}</h3></header>`,
    wizardActions: () => '<footer class="wizard-actions"></footer>',
    summary: (label, value) =>
      `<div class="summary-item"><span>${label}</span><strong>${value}</strong></div>`,
    getWizardApplication: () =>
      win.applications.find((item) => item.id === win.wizard.selectedApplicationId),
    captureWizardData: vi.fn(),
    showToast: vi.fn(),
    logAudit: vi.fn(),
    showModal: vi.fn(),
    closeModal: vi.fn(),
    ensureWorkflowData: vi.fn(),
    submitApplication: vi.fn(),
    navTo: vi.fn(),
    stepLoan: () => '<section><div class="field-grid three">Loan fields</div></section>',
    stepImdBsa: () => '<section><div class="field-grid three">IMD fields</div></section>',
    stepReview: () => '<section><div class="notice success">Ready</div></section>',
  });

  win.renderWizard = vi.fn(() => {
    let markup = "";
    if (win.wizard.step === 5) markup = win.nfPDMarkup?.() || "";
    if (win.wizard.step === 6) markup = win.stepLoan();
    if (win.wizard.step === 7) markup = win.stepImdBsa();
    if (win.wizard.step === 8) markup = win.stepReview();
    win.document.body.innerHTML = `<main class="los-application">${markup}</main>`;
  });
  win.wizardNext = vi.fn(() => {
    win.wizard.step += 1;
    win.renderWizard();
  });
  win.wizardBack = vi.fn(() => {
    win.wizard.step = Math.max(0, win.wizard.step - 1);
    win.renderWizard();
  });
  win.goWizardStep = vi.fn((step) => {
    win.wizard.step = step;
    win.renderWizard();
  });
  win.selectLosApplication = vi.fn((id) => {
    const app = win.applications.find((item) => item.id === id);
    win.wizard.selectedApplicationId = id;
    win.wizard.product = app.product;
    win.wizard.data = {};
    win.wizard.docs = {};
    win.renderWizard();
  });

  Object.defineProperty(win.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((success, failure) => {
        if (geoMode === "denied") {
          failure({ code: 1, message: "denied" });
          return;
        }
        success({
          coords: { latitude: 26.9124, longitude: 75.7873, accuracy: 12 },
          timestamp: Date.parse("2026-10-08T05:30:00.000Z"),
        });
      }),
    },
  });
  const camera = vi.fn();
  Object.defineProperty(win.navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: camera },
  });

  const script = makeWorkflowPDScript("/api", true).replace(/^<script>|<\/script>$/g, "");
  win.eval(script);
  win.renderWizard();

  return {
    win,
    records,
    requests,
    pdWrites,
    camera,
    setGeoMode: (mode) => {
      geoMode = mode;
    },
  };
}

function setField(win, id, value, eventType = "input") {
  const field = win.document.getElementById(id);
  field.value = value;
  field.dispatchEvent(new win.Event(eventType, { bubbles: true }));
}

function fillRequiredFields(win, suffix) {
  setField(win, "pd-type", "Business PD");
  setField(win, "pd-meetingAt", "2026-10-08T10:30");
  setField(win, "pd-personMet", `Applicant ${suffix}`);
  setField(win, "pd-location", `Business premises ${suffix}`);
  setField(win, "pd-remarks", `Business activity verified for application ${suffix}`);
  setField(win, "pd-status", "Recommended");
}

const PNG_BYTES = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="), c => c.charCodeAt(0));

async function uploadAndConfirm(win, fileName) {
  const input = win.document.querySelector("#pdPictureFile");
  const file = new win.File([PNG_BYTES], fileName, { type: "image/png" });
  Object.defineProperty(input, "files", { configurable: true, value: [file] });
  win.nfPDUsePictureFile(input);
  await flush();
  expect(win.document.querySelector(".pd-photo-stage img")).not.toBeNull();
  win.nfPDConfirmPicture();
}

afterEach(() => {
  while (activeDoms.length) activeDoms.pop().window.close();
});

describe("PD browser behavior", () => {
  it("keeps explicitly browser-local PD cases out of the server session and API", async () => {
    const { win } = createHarness();
    await flush();
    win.fetch.mockClear();
    win.applications[0].browserLocalOnly = true;
    win.nfPDReload();
    await flush();

    expect(win.fetch).not.toHaveBeenCalled();
    expect(win.getWizardApplication().serverPersisted).toBe(false);
    expect(win.localStorage.getItem("namdev-pd-records-v3")).not.toBeNull();
  });

  it("runs the workflow through rendered button clicks and explains premature actions", async () => {
    const { win } = createHarness({ local: true });
    await flush();
    const click = async (label) => {
      const button = [...win.document.querySelectorAll(".pd-primary-actions button")].find(
        (item) => item.textContent === label,
      );
      expect(button.disabled).toBe(false);
      button.click();
      await flush();
    };
    await click("Verify PD");
    expect(win.document.querySelector("#pdError").textContent).toContain("Save the current PD");
    await click("Bureau Check");
    expect(win.document.querySelector("#pdError").textContent).toContain("send it to CAM");
    await click("Save PD");
    expect(win.document.querySelector("#pdError").textContent).toContain("Person Met");
    fillRequiredFields(win, "A");
    win.nfPDCaptureLocation();
    await uploadAndConfirm(win, "a.png");
    await click("Save PD");
    expect(win.document.body.textContent).toContain("Verification Pending");
    await click("Reload Saved PD");
    expect(win.document.querySelector("#pd-personMet").value).toBe("Applicant A");
    await click("Verify PD");
    expect(win.document.body.textContent).toContain("Verified");
    await click("Send To CAM");
    expect(win.document.body.textContent).toContain("Sent To CAM");
    await click("Bureau Check");
    const saved = JSON.parse(win.localStorage.getItem("namdev-pd-records-v3"))["LOS-A-001"];
    expect(saved.bureau.status).toBe("Pending Integration");
    expect(saved.pdHistory).toHaveLength(1);
    win.wizardNext();
    expect(win.wizard.step).toBe(6);
  });

  it("explains a read-only Save click without granting edit permissions", async () => {
    const { win } = createHarness({ local: true });
    await flush();
    win.currentUser = { role: "CEO", name: "CEO" };
    win.nfCan = (action) => action === "view";
    win.nfPDReload();
    await flush();
    const save = win.document.querySelector('button[type="submit"]');
    expect(save.disabled).toBe(false);
    save.click();
    await flush();
    expect(win.document.querySelector("#pdError").textContent).toContain("CEO");
    expect(win.document.querySelector("#pdError").textContent).toContain("cannot edit PD");
    expect(win.getWizardApplication().pd).toBeUndefined();
  });

  it("loads restored PD when a case is reopened from an earlier LOS step", async () => {
    const { win } = createHarness({ local: true });
    await flush();
    fillRequiredFields(win, "A");
    win.nfPDCaptureLocation();
    await uploadAndConfirm(win, "a.png");
    await win.nfPDSave();
    win.selectLosApplication("LOS-B-002");
    await flush();
    win.goWizardStep(0);
    win.selectLosApplication("LOS-A-001");
    await flush();
    expect(win.wizard.step).toBe(5);
    expect(win.document.querySelector("#pd-personMet").value).toBe("Applicant A");
    expect(win.document.querySelector('button[type="submit"]').disabled).toBe(false);
    expect(win.document.body.textContent).not.toContain("could not be loaded");
  });

  it("ignores a late location response after leaving PD", async () => {
    const { win } = createHarness({ local: true });
    await flush();
    fillRequiredFields(win, "A");
    let resolve;
    win.navigator.geolocation.getCurrentPosition = (success) => {
      resolve = success;
    };
    win.nfPDCaptureLocation();
    win.wizardBack();
    resolve({ coords: { latitude: 26, longitude: 75, accuracy: 10 }, timestamp: Date.now() });
    win.goWizardStep(5);
    await flush();
    expect(win.document.querySelector("#pd-personMet").value).toBe("Applicant A");
    expect(win.document.querySelector(".pd-evidence-state").textContent).toContain(
      "Location not captured",
    );
  });

  it("retains the live camera after a form repaint and reports invalid replacement uploads", async () => {
    const { win, camera } = createHarness({ local: true });
    await flush();
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] };
    camera.mockResolvedValue(stream);
    await win.nfPDOpenCamera();
    setField(win, "pd-followUpRequired", "Yes", "change");
    expect(win.document.querySelector("#pdCamera").srcObject).toBe(stream);
    expect(win.document.querySelector("#pdCapturePicture").disabled).toBe(false);
    await uploadAndConfirm(win, "a.png");
    expect(stop).toHaveBeenCalled();
    win.nfPDUsePictureFile({ files: [new win.File(["bad"], "bad.txt", { type: "text/plain" })] });
    expect(win.document.querySelector("#pdCameraStatus").textContent).toContain("Choose a JPEG");
    const fake = new win.File(["not an image"], "fake.png", { type: "image/png" });
    const fakeInput = win.document.querySelector("#pdPictureFile");
    Object.defineProperty(fakeInput, "files", { configurable: true, value: [fake] });
    win.nfPDUsePictureFile(fakeInput);
    await flush();
    expect(win.document.querySelector("#pdCameraStatus").textContent).toContain("not a valid image");
    expect(win.document.querySelector(".pd-photo-stage img")).not.toBeNull();
  });

  it("retains the original PD officer when another employee opens the saved visit", async () => {
    const { win } = createHarness({ local: true });
    await flush();
    fillRequiredFields(win, "A");
    win.nfPDCaptureLocation();
    await uploadAndConfirm(win, "a.png");
    await win.nfPDSave();
    win.currentUser = { role: "BDM", name: "Other Officer" };
    win.nfPDReload();
    await flush();
    expect(win.document.querySelector('input[readonly]:not(#pd-code)').value).toBe("Neha Jain");
  });

  it("preserves saved verification across a fresh page and reports storage failures without success", async () => {
    const { win } = createHarness({ local: true });
    await flush();
    fillRequiredFields(win, "A");
    win.nfPDCaptureLocation();
    await uploadAndConfirm(win, "a.png");
    await win.nfPDSave();
    await win.nfPDAction("verify-pd");
    const storage = Object.fromEntries(
      Object.keys(win.localStorage).map((key) => [key, win.localStorage.getItem(key)]),
    );
    const reopened = createHarness({ local: true, storage });
    await flush();
    expect(reopened.win.document.querySelector("#pd-personMet").value).toBe("Applicant A");
    expect(reopened.win.document.body.textContent).toContain("Verified");
    setField(reopened.win, "pd-remarks", "Changed visit findings");
    await reopened.win.nfPDSave();
    expect(reopened.win.document.body.textContent).toContain("Verification Pending");
    const saved = JSON.parse(reopened.win.localStorage.getItem("namdev-pd-records-v3"))[
      "LOS-A-001"
    ];
    expect(saved.pdHistory).toHaveLength(2);
    expect(saved.pdHistory[0].recordId).toBe(saved.pdHistory[1].recordId);
    const setItem = vi.spyOn(reopened.win.Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });
    setField(reopened.win, "pd-remarks", "Another unsaved change");
    expect(await reopened.win.nfPDSave()).toBe(false);
    expect(reopened.win.document.querySelector("#pdError").textContent).toContain(
      "Storage quota exceeded",
    );
    setItem.mockRestore();
  });

  it("reports no saved record without clearing entered fields and respects workspace permissions", async () => {
    const { win } = createHarness({ local: true });
    await flush();
    setField(win, "pd-personMet", "Unsaved visitor");
    win.nfPDReload();
    await flush();
    expect(win.document.body.textContent).toContain(
      "No saved PD record found for this application.",
    );
    expect(win.document.querySelector("#pd-personMet").value).toBe("Unsaved visitor");
    win.nfCan = () => false;
    expect(await win.nfPDSave()).toBe(false);
    expect(win.document.querySelector("#pdError").textContent).toContain("cannot edit");
  });
  it("opens and saves browser-owned LOS cases without a second login or API token", async () => {
    const { win, requests } = createHarness({ local: true });
    await flush();
    expect(win.document.querySelector("#pdForm")).not.toBeNull();
    expect(win.document.querySelector("#pd-type").disabled).toBe(false);
    fillRequiredFields(win, "A");
    win.nfPDCaptureLocation();
    await uploadAndConfirm(win, "local-visit.png");
    expect(await win.nfPDSave()).toBe(true);
    expect(await win.nfPDSave()).toBe(true);
    let stored = JSON.parse(win.localStorage.getItem("namdev-pd-records-v3"))["LOS-A-001"];
    expect(stored.pdHistory).toHaveLength(1);
    expect(stored.pdVerification.status).toBe("Verification Pending");
    await win.nfPDAction("send-to-cam");
    expect(win.document.querySelector("#pdError").textContent).toContain("Verify the latest");
    await win.nfPDAction("verify-pd");
    win.nfPDReload();
    await flush();
    expect(win.document.querySelector("#pd-personMet").value).toBe("Applicant A");
    expect(win.document.body.textContent).toContain("1 record");
    win.wizardNext();
    expect(win.wizard.step).toBe(6);
    expect(win.wizard.selectedApplicationId).toBe("LOS-A-001");
    win.goWizardStep(5);
    await win.nfPDAction("send-to-cam");
    await win.nfPDAction("bureau-check");
    const saved = JSON.parse(win.localStorage.getItem("namdev-pd-records-v3"))["LOS-A-001"];
    expect(saved.cam.status).toBe("Pending");
    expect(saved.bureau.status).toBe("Pending Integration");
    win.selectLosApplication("LOS-B-002");
    await flush();
    expect(win.document.querySelector("#pd-personMet").value).toBe("");
    expect(requests).toHaveLength(0);
  });
  it("uses the selected LOS application and existing employee session", async () => {
    const { win, requests } = createHarness();
    await flush();

    const page = win.document.body.textContent;
    expect(page).toContain("Asha Enterprises");
    expect(page).toContain("DEAL-A-301");
    expect(page).toContain("LEAD-A-101");
    expect(page).toContain("CUS-A-201");
    expect(win.document.querySelector("input[readonly]:not(#pd-code)").value).toBe("Neha Jain");
    expect(page).not.toContain("Registered email");
    expect(page).not.toContain("Password");
    expect(page).not.toContain("Select Case");
    expect(requests.some(({ path }) => path === "/auth/me")).toBe(false);
    expect(requests[0].headers.Authorization).toBe("Bearer test-employee-session-token");
    expect(requests[0].headers).not.toHaveProperty("X-Namdev-Demo-Name");
  });

  it("saves evidence and history, gates Loan, and sends the same case to CAM and Bureau", async () => {
    const { win, records, pdWrites } = createHarness();
    await flush();

    setField(win, "pd-followUpRequired", "Yes", "change");
    expect(win.document.querySelector("#pd-followUpAt")).not.toBeNull();
    setField(win, "pd-followUpRequired", "No", "change");
    expect(win.document.querySelector("#pd-followUpAt")).toBeNull();

    fillRequiredFields(win, "A");
    win.nfPDCaptureLocation();
    expect(win.document.body.textContent).toContain("Location Captured");
    await uploadAndConfirm(win, "visit-a.png");

    expect(await win.nfPDSave()).toBe(true);
    expect(pdWrites.get("LOS-A-001")).toBe(1);
    expect(records.get("LOS-A-001").pd.applicationId).toBe("LOS-A-001");
    expect(records.get("LOS-A-001").pd.leadId).toBe("LEAD-A-101");
    expect(records.get("LOS-A-001").pd.customerId).toBe("CUS-A-201");
    expect(records.get("LOS-A-001").pd.doneByName).toBe("Neha Jain");
    expect(records.get("LOS-A-001").pdHistory).toHaveLength(1);
    expect(win.document.body.textContent).toContain("1 record");
    expect(win.document.body.textContent).toContain("Applicant A");

    win.nfPDReload();
    await flush();
    expect(win.document.querySelector("#pd-personMet").value).toBe("Applicant A");

    await win.nfPDAction("verify-pd");
    win.wizardNext();
    expect(win.wizard.step).toBe(6);
    expect(win.wizard.selectedApplicationId).toBe("LOS-A-001");
    expect(win.document.body.textContent).toContain("Asha Enterprises");
    expect(win.document.body.textContent).toContain("Recommended");

    win.goWizardStep(5);
    await win.nfPDAction("send-to-cam");
    expect(records.get("LOS-A-001").cam.status).toBe("Pending");
    expect(win.document.querySelector("#pd-type").disabled).toBe(true);

    await win.nfPDAction("bureau-check");
    expect(records.get("LOS-A-001").bureau.status).toBe("Pending Integration");
    expect(win.document.body.textContent).toContain("BUREAU-LOS-A-001");
  });

  it("handles denied permissions, blocks incomplete PD, and keeps two applications isolated", async () => {
    const { win, records, pdWrites, camera, setGeoMode } = createHarness();
    await flush();

    win.selectLosApplication("LOS-B-002");
    await flush();
    expect(win.document.body.textContent).toContain("Bharat Auto Works");
    expect(win.document.body.textContent).not.toContain("Asha Enterprises");

    win.wizardNext();
    expect(win.wizard.step).toBe(5);
    expect(win.showToast).toHaveBeenCalledWith(
      "Save the current PD before continuing to Loan & Repayment.",
    );

    fillRequiredFields(win, "B");
    expect(await win.nfPDSave()).toBe(false);
    expect(win.document.querySelector("#pdError").textContent).toContain("Capture the PD location");
    expect(pdWrites.get("LOS-B-002")).toBe(0);

    setGeoMode("denied");
    win.nfPDCaptureLocation();
    expect(win.document.body.textContent).toContain("Location permission is required to capture the visit location");

    const denied = new Error("denied");
    denied.name = "NotAllowedError";
    camera.mockRejectedValueOnce(denied);
    await win.nfPDOpenCamera();
    expect(win.document.querySelector("#pdCameraStatus").textContent).toContain(
      "Camera permission is required to capture the visit picture",
    );

    setGeoMode("success");
    win.nfPDCaptureLocation();
    expect(await win.nfPDSave()).toBe(false);
    expect(win.document.querySelector("#pdError").textContent).toContain(
      "Capture and confirm the PD picture",
    );

    await uploadAndConfirm(win, "visit-b.png");
    expect(await win.nfPDSave()).toBe(true);
    expect(records.get("LOS-B-002").pd.personMet).toBe("Applicant B");
    expect(records.get("LOS-B-002").pdHistory).toHaveLength(1);

    win.selectLosApplication("LOS-A-001");
    await flush();
    expect(win.document.body.textContent).toContain("Asha Enterprises");
    expect(win.document.body.textContent).not.toContain("Applicant B");
    expect(records.get("LOS-A-001").pdHistory).toHaveLength(0);

    win.selectLosApplication("LOS-B-002");
    await flush();
    expect(win.document.querySelector("#pd-personMet").value).toBe("Applicant B");
    expect(win.document.body.textContent).toContain("1 record");
  });
});
