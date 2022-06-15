/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * @jest-environment node
 */
import { validateNewFilename } from "./project-utils";
import { stubIntl as intl } from "../messages/testing";

describe("validateNewFilename", () => {
  const exists = (filename: string) => filename === "main.py";

  it("requires non-empty name", () => {
    expect(validateNewFilename("", exists, intl)).toEqual(
      "file-name-not-empty"
    );
  });
  it("length", () => {
    expect(validateNewFilename("a".repeat(121), exists, intl)).toEqual(
      "file-name-length"
    );
    expect(validateNewFilename("a".repeat(120), exists, intl)).toBeUndefined();
  });
  it("no error for Python extensions", () => {
    expect(validateNewFilename("foo.py", exists, intl)).toBeUndefined();
  });
  it("errors for spaces", () => {
    expect(validateNewFilename("spaces are not allowed", exists, intl)).toEqual(
      "file-name-whitespace"
    );
  });
  it("errors for other invalid chars", () => {
    expect(validateNewFilename("wow!64", exists, intl)).toEqual(
      "file-name-invalid-character"
    );
  });
  it("errors for leading number", () => {
    expect(validateNewFilename("99greenbottles", exists, intl)).toEqual(
      "file-name-start-number"
    );
  });
  it("errors for uppercase", () => {
    expect(validateNewFilename("OHNO", exists, intl)).toEqual(
      "file-name-lowercase-only"
    );
  });
  it("errors for file clashes", () => {
    expect(validateNewFilename("main", exists, intl)).toEqual(
      "file-already-exists"
    );
  });
  it("accepts valid names", () => {
    expect(
      validateNewFilename("underscores_are_allowed", exists, intl)
    ).toBeUndefined();
  });
});
