/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { captureException } from "@sentry/browser";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reportError } from "./sentry";

vi.mock("@sentry/browser", () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  init: vi.fn(),
}));

const dsn = "https://example@sentry.example.com/1";

const captured = () => {
  expect(captureException).toHaveBeenCalledTimes(1);
  return vi.mocked(captureException).mock.calls[0];
};

describe("reportError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("does nothing beyond console when Sentry is disabled", () => {
    reportError(undefined, "Oops", new Error("boom"));
    expect(captureException).not.toHaveBeenCalled();
  });

  it("passes Error instances through unchanged", () => {
    const e = new Error("boom");
    reportError(dsn, "Oops", e);
    const [error, hint] = captured();
    expect(error).toBe(e);
    expect(hint).toBeUndefined();
  });

  it("converts Error-like objects, keeping other fields as extra", () => {
    // Shape of Emscripten's ExitStatus after structured clone over postMessage.
    reportError(dsn, "Simulator internal error", {
      name: "ExitStatus",
      message: "Program terminated with exit(1)",
      status: 1,
    });
    const [error, hint] = captured();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).name).toBe("ExitStatus");
    expect((error as Error).message).toBe("Program terminated with exit(1)");
    expect((error as Error).stack).toBeUndefined();
    expect(hint).toEqual({ extra: { status: 1 } });
  });

  it("merges caller context with fields from the object", () => {
    reportError(
      dsn,
      "Oops",
      { message: "boom", status: 1, phase: "object" },
      { phase: "caller", docLength: 3 }
    );
    const [, hint] = captured();
    expect(hint).toEqual({
      extra: { status: 1, phase: "caller", docLength: 3 },
    });
  });

  it("attaches caller context to Error instances", () => {
    reportError(dsn, "Oops", new Error("boom"), { phase: "update" });
    const [, hint] = captured();
    expect(hint).toEqual({ extra: { phase: "update" } });
  });

  it("serialises objects without a message", () => {
    reportError(dsn, "Oops", { code: 42 });
    const [error, hint] = captured();
    expect((error as Error).name).toBe("Error");
    expect((error as Error).message).toBe('{"code":42}');
    expect(hint).toEqual({ extra: { code: 42 } });
  });

  it("converts primitives", () => {
    reportError(dsn, "Oops", "just a string");
    const [error, hint] = captured();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("just a string");
    expect(hint).toBeUndefined();
  });
});
