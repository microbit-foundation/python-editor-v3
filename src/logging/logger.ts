/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Event, Logging } from "./logging";
import { initSentry, reportBreadcrumb, reportError } from "./sentry";
import { AnalyticsParams, AnalyticsSink } from "./sink";

/**
 * Standard Logging implementation: handles the cross-cutting concerns
 * (Sentry init / error capture / event breadcrumbs, param building,
 * product injection, console.log) and delegates the analytics SDK calls
 * to an AnalyticsSink.
 *
 * Events are sent in GA4-native shape (name + flat params) — call-site
 * `detail` fields become event params directly. See
 * docs/analytics-events.md for the catalogue.
 */
export class Logger implements Logging {
  private sentryDsn: string | undefined;

  constructor(
    private sink: AnalyticsSink,
    env: Record<string, string>,
    private product: string
  ) {
    this.sentryDsn = initSentry(env);
  }

  event(event: Event): void {
    this.sink.event(event.type, this.buildParams(event));
    reportBreadcrumb(this.sentryDsn, "Event", {
      type: event.type,
      message: event.message,
      value: event.value,
      detail: event.detail as unknown,
    });
  }

  setUserProperty(name: string, value: string): void {
    this.sink.setUserProperty(name, value);
  }

  error(message: string, e: unknown): void {
    reportError(this.sentryDsn, message, e);
  }

  log(v: unknown): void {
    console.log(v);
  }

  private buildParams(event: Event): AnalyticsParams {
    const params: AnalyticsParams = {};
    if (
      event.detail !== undefined &&
      typeof event.detail === "object" &&
      event.detail !== null
    ) {
      for (const [k, v] of Object.entries(
        event.detail as Record<string, unknown>
      )) {
        if (isPrimitive(v)) {
          params[k] = v;
        }
      }
    }
    // Top-level fields set last so they can't be shadowed by detail
    // keys of the same name.
    if (event.message !== undefined) {
      params.message = event.message;
    }
    if (event.value !== undefined) {
      params.value = event.value;
    }
    // Product is injected here so it lands on every event without
    // call sites having to pass it. See BrandConfig.product.
    params.product = this.product;
    return params;
  }
}

const isPrimitive = (v: unknown): v is string | number | boolean =>
  typeof v === "string" || typeof v === "number" || typeof v === "boolean";
