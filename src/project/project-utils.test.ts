/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { validateNewFilename } from "./project-utils";
import { stubIntl as intl } from "../messages/testing";

describe("validateNewFilename", () => {
  const exists = (filename: string) => filename === "main.py";

  it("required non-empty name", () => {
    expect(validateNewFilename("", exists, intl)).toEqual("name-not-empty");
  });
  it("errors for Python extensions", () => {
    expect(validateNewFilename("foo.py", exists, intl)).toEqual(
      "lowercase-no-space"
    );
  });
  it("errors for spaces", () => {
    expect(validateNewFilename("spaces are not allowed", exists, intl)).toEqual(
      "lowercase-no-space"
    );
  });
  it("errors for uppercase", () => {
    expect(validateNewFilename("OHNO", exists, intl)).toEqual(
      "lowercase-no-space"
    );
  });
  it("errors for file clashes", () => {
    expect(validateNewFilename("main", exists, intl)).toEqual("already-exists");
  });
  it("accepts valid names", () => {
    expect(
      validateNewFilename("underscores_are_allowed", exists, intl)
    ).toBeUndefined();
  });
});
