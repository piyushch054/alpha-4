// @vitest-environment jsdom

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { workflowCeoOversightScript } from "@/lib/workflow-ceo-oversight";

const activeDoms = [];
const ceoStyles = readFileSync(
  resolve(process.cwd(), "public/workflow/ceo-dashboard.css"),
  "utf8",
);

function createCeoDashboard(markup) {
  const dom = new JSDOM(markup, {
    runScripts: "outside-only",
    url: "http://localhost/workspace",
  });
  activeDoms.push(dom);
  const win = dom.window;
  Object.assign(win, {
    currentUser: { role: "CEO" },
    BASE_ACCESS: { CEO: ["dashboard", "sendBack"] },
    roleCanView: () => true,
    closeModal: () => {},
    showToast: () => {},
    navTo: () => {},
    applyRoleAccess: () => {},
    openAppLauncher: () => {},
    renderApprovalCenter: () => {},
    renderCase: () => {},
    roleMeta: () => ({ dept: "Executive" }),
    applications: [],
    auditEvents: [],
    NAMDEV_WORKSPACE_CONFIG: {},
  });
  win.localStorage.setItem("namdevSelectedWorkspaces", JSON.stringify({}));
  win.eval(workflowCeoOversightScript.replace(/^<script>/, "").replace(/<\/script>$/, ""));
  return dom;
}

afterEach(() => {
  activeDoms.splice(0).forEach((dom) => dom.window.close());
});

describe("CEO dashboard workspace empty state", () => {
  it("does not show an empty state when the active CEO dashboard cards are present", () => {
    const dom = createCeoDashboard(
      '<div id="content"><div class="ceo-root"><div class="ceo-main"><div class="ceo-kpi-card" data-kpi="aum"></div><section class="ceo-card"></section></div></div></div>',
    );
    const root = dom.window.document.querySelector(".ceo-root");

    expect(root.querySelector(".ws-empty-state")).toBeNull();
    expect(root.children).toHaveLength(1);
    expect(root.firstElementChild.className).toBe("ceo-main");
  });

  it("keeps a real empty state inside the dashboard content instead of beside it", () => {
    const dom = createCeoDashboard(
      '<div id="content"><div class="ceo-root"><div class="ceo-main"></div></div></div>',
    );
    const root = dom.window.document.querySelector(".ceo-root");
    const main = root.querySelector(".ceo-main");

    expect(root.querySelector(".ws-empty-state")).not.toBeNull();
    expect(root.children).toHaveLength(1);
    expect(main.querySelector(".ws-empty-state")).not.toBeNull();
  });

  it("keeps chart SVGs full-size while preserving icon sizing", () => {
    const dom = new JSDOM(
      `<style>${ceoStyles}</style><div class="ceo-root"><svg class="ceo-chart-svg"></svg><svg></svg></div>`,
    );
    activeDoms.push(dom);
    const [chart, icon] = dom.window.document.querySelectorAll("svg");

    expect(dom.window.getComputedStyle(chart).width).toBe("100%");
    expect(dom.window.getComputedStyle(chart).height).toBe("100%");
    expect(dom.window.getComputedStyle(icon).width).toBe("16px");
    expect(dom.window.getComputedStyle(icon).height).toBe("16px");
  });
});
