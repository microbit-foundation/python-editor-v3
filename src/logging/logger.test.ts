/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "./logger";
import { AnalyticsParams, AnalyticsSink } from "./sink";

class RecordingSink implements AnalyticsSink {
  events: Array<{ name: string; params: AnalyticsParams }> = [];
  userProperties: Record<string, string> = {};
  event(name: string, params: AnalyticsParams): void {
    this.events.push({ name, params });
  }
  setUserProperty(name: string, value: string): void {
    this.userProperties[name] = value;
  }
}

describe("Logger", () => {
  let sink: RecordingSink;
  let logger: Logger;

  beforeEach(() => {
    // No Sentry DSN: breadcrumbs fall back to console.log.
    vi.spyOn(console, "log").mockImplementation(() => {});
    sink = new RecordingSink();
    logger = new Logger(sink, {}, "python-editor");
  });

  it("flattens primitive detail fields into params and injects product", () => {
    logger.event({
      type: "project_save",
      detail: { format: "hex", files: 3, is_default: false },
    });
    expect(sink.events).toEqual([
      {
        name: "project_save",
        params: {
          format: "hex",
          files: 3,
          is_default: false,
          product: "python-editor",
        },
      },
    ]);
  });

  it("drops non-primitive and undefined detail values", () => {
    logger.event({
      type: "docs_navigate",
      detail: { via: "user", surface: "reference", id: undefined, nested: {} },
    });
    expect(sink.events[0].params).toEqual({
      via: "user",
      surface: "reference",
      product: "python-editor",
    });
  });

  it("lets top-level message and value win over detail keys", () => {
    logger.event({
      type: "x",
      message: "top",
      value: 2,
      detail: { message: "detail", value: 1 },
    });
    expect(sink.events[0].params).toEqual({
      message: "top",
      value: 2,
      product: "python-editor",
    });
  });

  it("sends events with no detail as product only", () => {
    logger.event({ type: "docs_search" });
    expect(sink.events[0].params).toEqual({ product: "python-editor" });
  });

  it("passes user properties to the sink", () => {
    logger.setUserProperty("webusb_available", "yes");
    expect(sink.userProperties).toEqual({ webusb_available: "yes" });
  });
});
