/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  isProjectLink,
  parseProjectLink,
  PendingProjectLink,
} from "./project-link";
import { testProjectLink, testProjectLinkUrl } from "./project-link-test-data";

describe("parseProjectLink", () => {
  it("parses valid URL", () => {
    const result = parseProjectLink(testProjectLinkUrl);
    expect(result).toEqual({
      status: "ok",
      link: {
        meta: {
          cloudId: "microbit.org",
          comment: "",
          editor: "python",
          name: "Hearts",
        },
        source: `from microbit import *\r\ndisplay.show(Image.HEART)`,
      },
    });
  });
  it("says a link it cannot read is unreadable", () => {
    const result = parseProjectLink(
      "https://python.microbit.org/v/2#import:#project:=XQAAgACRAAAAAAAAAAA9iImmlGSt1R="
    );
    expect(result).toEqual({ status: "unreadable" });
  });
  it("says so when the URL has no project link", () => {
    const result = parseProjectLink(
      "https://python.microbit.org/v/2#import:#notAProject:XQAAgACRAAAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOM4sSAXBT95G3en+tghrYmE+YJp6EiYgzA9ThKkyShWq2UdvmCzqxoNfYc1wlmTqlNv/Piaz3WoSe3flvr/ItyLl0aolQlEpv4LA8A="
    );
    expect(result).toEqual({ status: "none" });
  });
  it("isProjectLink checks fields", () => {
    expect(isProjectLink({})).toEqual(false);
    expect(isProjectLink({ meta: { name: "foo" } })).toEqual(false);
    expect(isProjectLink({ meta: {}, source: "" })).toEqual(false);
    expect(isProjectLink({ meta: { name: "foo" }, source: "" })).toEqual(true);
  });
});

describe("PendingProjectLink", () => {
  it("hands its link out once", () => {
    const pending = new PendingProjectLink(testProjectLink);
    expect(pending.pending).toEqual(true);
    expect(pending.take()).toEqual(testProjectLink);
    expect(pending.pending).toEqual(false);
    expect(pending.take()).toBeUndefined();
  });

  it("has nothing to hand out without one", () => {
    const pending = new PendingProjectLink();
    expect(pending.pending).toEqual(false);
    expect(pending.take()).toBeUndefined();
  });
});
