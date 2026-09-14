/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { routerPathFromUrl } from "./urls";

describe("routerPathFromUrl", () => {
  it("returns the path and query at the root", () => {
    expect(
      routerPathFromUrl("http://localhost:3000/project?flag=none", undefined)
    ).toEqual("/project?flag=none");
  });

  it("drops the basename", () => {
    expect(
      routerPathFromUrl(
        "https://python.microbit.org/v/3/project/reference/display",
        "/v/3"
      )
    ).toEqual("/project/reference/display");
  });

  it("maps the basename itself to the root", () => {
    expect(
      routerPathFromUrl("https://python.microbit.org/v/3", "/v/3")
    ).toEqual("/");
  });
});
