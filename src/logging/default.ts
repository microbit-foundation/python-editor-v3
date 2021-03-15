import { stage, version } from "../environment";
import { Event, Logging } from "./logging";
import {
  init as sentryInit,
  addBreadcrumb as sentryAddBreadcrumb,
  captureException as sentryCaptureException,
  Severity as SentrySeverity,
} from "@sentry/browser";

const sentryDsn: string | undefined = process.env.REACT_APP_SENTRY_DSN;

export class DefaultLogging implements Logging {
  constructor() {
    if (sentryDsn) {
      sentryInit({
        dsn: process.env.SENTRY_,
        release: `python-editor-v${version}`,
        environment: stage,
      });
    }
  }

  log(v: any) {
    console.log(v);
  }

  error(e: any) {
    console.error(e);
    if (sentryDsn) {
      sentryCaptureException(e);
    }
  }

  event(event: Event) {
    const { label, value, action, context } = event;

    // Use GA if configured.
    const gtag = (window as any).gtag;
    if (gtag) {
      const event: Record<string, any> = {
        event_category: "Python Editor " + process.env.REACT_APP_VERSION,
      };
      if (label) {
        event.event_label = label;
      }
      if (typeof value === "number") {
        event.value = value;
      }
      gtag("event", action, event);
    }

    // eslint-disable-next-line
    const data = {
      action,
      label,
      value: value === 1 ? undefined : value,
      ...context,
    };
    breadcrumb("Event", data);
  }
}

const breadcrumb = (category: string, data: object | string) => {
  if (sentryDsn) {
    sentryAddBreadcrumb({
      category,
      message: typeof data === "string" ? data : undefined,
      data: typeof data === "object" ? data : undefined,
      level: SentrySeverity.Info,
    });
  }
  if (process.env.NODE_ENV !== "production") {
    // Avoid for production as console output is also sent to Sentry so you get duplicates.
    console.log(category, JSON.stringify(data));
  }
};
