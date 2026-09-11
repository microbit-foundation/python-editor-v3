/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SharedUIProvider } from "@microbit/ui";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { IntlProvider } from "react-intl";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LoggingProvider } from "./logging/logging-hooks";
import { MockLogging } from "./logging/mock";
import RootLayout from "./RootLayout";

const Thrower = () => {
  throw new Error("boom");
};

it("shows the error page with the report reference when a route throws", () => {
  // React reports the caught error to console.error and jsdom raises it as a
  // window error event; silence both.
  vi.spyOn(console, "error").mockImplementation(() => {});
  const swallow = (e: ErrorEvent) => e.preventDefault();
  window.addEventListener("error", swallow);
  try {
    const logging = new MockLogging();
    logging.errorReference = "evt-1";
    const router = createMemoryRouter([
      {
        element: <RootLayout />,
        children: [{ path: "/", element: <Thrower /> }],
      },
    ]);
    render(
      <IntlProvider locale="en">
        <SharedUIProvider>
          <LoggingProvider value={logging}>
            <RouterProvider router={router} />
          </LoggingProvider>
        </SharedUIProvider>
      </IntlProvider>
    );
    expect(
      screen.getByRole("heading", { name: "An unexpected error occurred" })
    ).toBeDefined();
    expect(screen.getByText(/Error reference/).textContent).toBe(
      "Error reference: evt-1"
    );
    expect(logging.errors).toHaveLength(1);
    expect(logging.errors[0].message).toBe("Uncaught render error");
    expect((logging.errors[0].e as Error).message).toBe("boom");
  } finally {
    window.removeEventListener("error", swallow);
  }
});
