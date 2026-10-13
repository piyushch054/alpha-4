import { describe, expect, it } from "vitest";

import Index from "@/routes/index";

describe("App routing", () => {
  it("redirects the root page to the workspace", () => {
    const element = Index();
    expect(element.props.to).toBe("/workspace");
    expect(element.props.replace).toBe(true);
  });
});
