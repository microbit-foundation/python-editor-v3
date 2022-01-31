/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { renderDocumentation, renderMarkdown } from "./documentation";

describe("renderDocumentation", () => {
  it("sanitizes html", () => {
    // We trust dompurify, we're just trying to check we don't accidentally use the unsanitised
    // html in future refactors.
    const node = renderDocumentation({
      kind: "markdown",
      value: "<script>alert(1)</script>",
    });
    expect(node.getElementsByTagName("script").length).toEqual(0);
  });
  it("passes through plain text", () => {
    const node = renderDocumentation("Plain text");
    expect(node.textContent).toEqual("Plain text");
  });
  it("defaults to placeholder", () => {
    const node = renderDocumentation(undefined);
    expect(node.textContent).toEqual("No documentation");
  });
});
describe("renderMarkdown", () => {
  it("sanitizes html", () => {
    const html = renderMarkdown("<script>alert(1)</script>");
    expect(html).toEqual({
      __html: "",
    });
  });
});
