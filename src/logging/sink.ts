/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export type AnalyticsParams = Record<string, string | number | boolean>;

/**
 * Output target for analytics events. The Logger owns the cross-cutting
 * concerns (Sentry, param building, breadcrumbs); the sink owns whatever
 * is specific to the analytics SDK in use. Same shape as ml-trainer's
 * sink so a native (Firebase) sink could be dropped in later.
 */
export interface AnalyticsSink {
  event(name: string, params: AnalyticsParams): void;
  setUserProperty(name: string, value: string): void;
}

type GtagFn = {
  (command: "event", eventName: string, params: AnalyticsParams): void;
  (
    command: "set",
    target: "user_properties",
    values: Record<string, string>
  ): void;
};

const gtag = () => (window as Window & { gtag?: GtagFn }).gtag;

/**
 * Web sink: emits events through gtag when shared-assets/common.js has
 * set it up. index.html only loads that script for Foundation builds
 * (VITE_FOUNDATION_BUILD) and the script itself is hostname-gated to
 * `*.microbit.org`, so OSS forks and local dev take the silent no-gtag
 * path. Consent is owned by the shared-assets cookie modal, see
 * src/compliance/web.tsx. GA4 Enhanced Measurement auto-collects
 * page_view, including the router's pushState navigation.
 */
export class WebSink implements AnalyticsSink {
  event(name: string, params: AnalyticsParams): void {
    gtag()?.("event", name, params);
  }

  setUserProperty(name: string, value: string): void {
    gtag()?.("set", "user_properties", { [name]: value });
  }
}
