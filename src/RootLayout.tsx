/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ErrorBoundary, UnexpectedErrorPage } from "@microbit/ui-patterns";
import { useCallback } from "react";
import { Outlet } from "react-router";
import { useDeployment } from "./deployment";
import { useLogging } from "./logging/logging-hooks";

/**
 * The root route. An uncaught render error below it shows the error page,
 * with the Sentry event id as the reference, rather than unmounting the app.
 */
const RootLayout = () => {
  const logging = useLogging();
  const { supportLink } = useDeployment();
  const handleError = useCallback(
    (error: unknown) => logging.error("Uncaught render error", error),
    [logging]
  );
  return (
    <ErrorBoundary
      onError={handleError}
      fallback={(_error, reference) => (
        <UnexpectedErrorPage supportUrl={supportLink} reference={reference} />
      )}
    >
      <Outlet />
    </ErrorBoundary>
  );
};

export default RootLayout;
