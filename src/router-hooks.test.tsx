/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LoggingProvider } from "./logging/logging-hooks";
import { MockLogging } from "./logging/mock";
import { NavigationSource, RouterState, useRouterState } from "./router-hooks";
import { editorRoutePath } from "./urls";

const result: { current?: ReturnType<typeof useRouterState> } = {};
const state = (): RouterState => result.current![0];
const setState = (state: RouterState, source?: NavigationSource) =>
  result.current![1](state, source);

const Probe = () => {
  const value = useRouterState();
  useEffect(() => {
    result.current = value;
  });
  return null;
};

const renderAt = (path: string) => {
  const logging = new MockLogging();
  const router = createMemoryRouter(
    [
      {
        path: "",
        children: [
          { path: editorRoutePath, element: <Probe /> },
          { path: "*", element: <Probe /> },
        ],
      },
    ],
    { initialEntries: [path] }
  );
  render(
    <LoggingProvider value={logging}>
      <RouterProvider router={router} />
    </LoggingProvider>
  );
  return { router, logging };
};

describe("useRouterState", () => {
  it("is empty at the root", () => {
    renderAt("/");
    expect(state()).toEqual({});
  });

  it("reads the tab and slug from the path", () => {
    renderAt("/reference/display");
    expect(state()).toEqual({
      tab: "reference",
      slug: { id: "display" },
      focus: false,
    });
  });

  it("ignores unknown tabs", () => {
    renderAt("/nonsense/display");
    expect(state()).toEqual({});
  });

  it("treats deeper paths as the editor with no tab", () => {
    renderAt("/api/a/b");
    expect(state()).toEqual({});
  });

  it("navigates, carrying focus in history state, and logs the source", async () => {
    const { router, logging } = renderAt("/");
    await act(async () => {
      setState({ tab: "api", slug: { id: "microbit" }, focus: true }, "code");
    });
    expect(router.state.location.pathname).toEqual("/api/microbit");
    expect(state()).toEqual({
      tab: "api",
      slug: { id: "microbit" },
      focus: true,
    });
    expect(logging.events).toEqual([
      {
        type: "docs_navigate",
        detail: { via: "code", surface: "api", id: "microbit" },
      },
    ]);
  });

  it("does not log without a source", async () => {
    const { logging } = renderAt("/");
    await act(async () => {
      setState({ tab: "ideas" });
    });
    expect(logging.events).toEqual([]);
  });

  it("gives a new state object when navigating to the same anchor again", async () => {
    renderAt("/reference/display");
    const before = state();
    await act(async () => {
      setState({ tab: "reference", slug: { id: "display" } });
    });
    expect(state()).not.toBe(before);
    expect(state()).toEqual(before);
  });
});
