/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { isProjectLink, parseProjectLink } from "./project-link";
import { testProjectLinkUrl } from "./project-link-test-data";

describe("parseProjectLink", () => {
  it("parses valid URL", () => {
    const result = parseProjectLink(testProjectLinkUrl);
    expect(result).toEqual({
      link: {
        meta: {
          cloudId: "microbit.org",
          comment: "",
          editor: "python",
          name: "Hearts",
        },
        source: `from microbit import *\r\ndisplay.show(Image.HEART)`,
      },
      urlWithoutLink: "http://localhost:3000/",
    });
  });
  it("undefined for nonsense", () => {
    const link = parseProjectLink(
      "https://python.microbit.org/v/2#import:#project:=XQAAgACRAAAAAAAAAAA9iImmlGSt1R="
    );
    expect(link).toEqual(undefined);
  });
  it("undefined for no project on URL", () => {
    const link = parseProjectLink(
      "https://python.microbit.org/v/2#import:#notAProject:XQAAgACRAAAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOM4sSAXBT95G3en+tghrYmE+YJp6EiYgzA9ThKkyShWq2UdvmCzqxoNfYc1wlmTqlNv/Piaz3WoSe3flvr/ItyLl0aolQlEpv4LA8A="
    );
    expect(link).toEqual(undefined);
  });
  it("isProjectLink checks fields", () => {
    expect(isProjectLink({})).toEqual(false);
    expect(isProjectLink({ meta: { name: "foo" } })).toEqual(false);
    expect(isProjectLink({ meta: {}, source: "" })).toEqual(false);
    expect(isProjectLink({ meta: { name: "foo" }, source: "" })).toEqual(true);
  });
});
