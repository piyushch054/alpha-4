import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { makeWorkflowPDScript } from "@/lib/workflow-pd";

describe("PD workflow integration", () => {
  const script = makeWorkflowPDScript("/api");

  it("uses the required field-visit types and decision statuses", () => {
    for (const value of [
      "Asset PD",
      "Business PD",
      "Red PD",
      "Pending",
      "In Progress",
      "Completed",
      "Recommended",
      "Not Recommended",
      "Hold",
      "Query Required",
    ]) {
      expect(script).toContain(value);
    }
    expect(script).not.toContain("Other PD");
  });

  it("uses the current employee and selected application without another login or selector", () => {
    expect(script).toContain("typeof currentUser !== 'undefined'");
    expect(script).toContain("getWizardApplication()");
    expect(script).toContain("Current application summary");
    expect(script).not.toContain("pdLoginForm");
    expect(script).not.toContain("pdEmail");
    expect(script).not.toContain("pdPassword");
    expect(script).not.toContain("Sign in to LOS");
    expect(script).not.toContain("Select Case");
  });

  it("contains functional save, history, CAM, bureau, geotag, and picture controls", () => {
    expect(script).toContain("'/applications/' + encodeURIComponent(app.id) + '/pd'");
    expect(script).toContain("nfPDAction(\\'send-to-cam\\')");
    expect(script).toContain("nfPDAction(\\'bureau-check\\')");
    expect(script).toContain("nfPDCaptureLocation");
    expect(script).toContain("navigator.geolocation.getCurrentPosition");
    expect(script).toContain("navigator.mediaDevices?.getUserMedia");
    expect(script).toContain("nfPDConfirmPicture");
    expect(script).toContain("pdHistory");
    expect(script).toContain("PD Done By");
  });

  it("links PD to application, lead, customer, product, loan, IMD/BSA, and review", () => {
    for (const value of [
      "applicationId",
      "leadId",
      "customerId",
      "product",
      "stepLoan",
      "stepImdBsa",
      "stepReview",
    ]) {
      expect(script).toContain(value);
    }
    expect(script).toContain("Save the current PD before continuing to Loan & Repayment");
    expect(script).toContain("Set PD Status to Completed or Recommended before continuing");
  });

  it("keeps PD exactly between Asset / Collateral and Loan & Repayment", () => {
    const applicationScript = readFileSync(
      new URL("../../public/workflow/app.js", import.meta.url),
      "utf8",
    );
    const asset = applicationScript.indexOf('"Asset / Collateral"');
    const pd = applicationScript.indexOf('"PD — Personal Discussion"');
    const loan = applicationScript.indexOf('"Loan & Repayment"');

    expect(asset).toBeGreaterThan(-1);
    expect(pd).toBeGreaterThan(asset);
    expect(loan).toBeGreaterThan(pd);
    expect(applicationScript).toContain("if (wizard.step === 5) return window.nfPDMarkup");
    expect(applicationScript).toContain("if (wizard.step === 6) return stepLoan()");
  });

});
