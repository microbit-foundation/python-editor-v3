/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ErrorBoundary, UnexpectedErrorPage } from "@microbit/ui-patterns";
import { useCallback } from "react";
import { RouterProvider } from "react-aria-components";
import { Outlet, useHref, useNavigate } from "react-router";
import StorageVersionErrorPage from "./fs/StorageVersionErrorPage";
import { useStorageVersionError } from "./fs/storage-status";
import { useDeployment } from "./deployment";
import { useLogging } from "./logging/logging-hooks";

/**
 * Only app paths go through the router, which adds the basename. It would
 * mangle an external URL, so those are left as they are.
 */
const useAppHref = (href: string) => {
  const isAppPath = href.startsWith("/") && !href.startsWith("//");
  const routerHref = useHref(isAppPath ? href : "/");
  return isAppPath ? routerHref : href;
};

/**
 * The root route. An uncaught render error below it shows the error page,
 * with the Sentry event id as the reference, rather than unmounting the app.
 *
 * react-aria links and menu items with an app path navigate in the app
 * rather than reloading the page.
 */
const RootLayout = () => {
  const navigate = useNavigate();
  const logging = useLogging();
  const { supportLink } = useDeployment();
  const handleError = useCallback(
    (error: unknown) => logging.error("Uncaught render error", error),
    [logging]
  );
  const storageVersionError = useStorageVersionError();
  return (
    <RouterProvider navigate={navigate} useHref={useAppHref}>
      <ErrorBoundary
        onError={handleError}
        fallback={(_error, reference) => (
          <UnexpectedErrorPage supportUrl={supportLink} reference={reference} />
        )}
      >
        {storageVersionError ? <StorageVersionErrorPage /> : <Outlet />}
      </ErrorBoundary>
    </RouterProvider>
  );
};

export default RootLayout;
