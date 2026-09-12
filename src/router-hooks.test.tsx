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
import { IframeModeProvider } from "./iframe-mode-hooks";
import { NavigationSource, RouterState, useRouterState } from "./router-hooks";
import { editorRoutePath, iframeEditorRoutePath } from "./urls";

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

const renderAt = (path: string, iframe = false) => {
  const logging = new MockLogging();
  const router = createMemoryRouter(
    [
      {
        path: "",
        children: [
          {
            path: iframe ? iframeEditorRoutePath : editorRoutePath,
            element: <Probe />,
          },
          { path: "*", element: <Probe /> },
        ],
      },
    ],
    { initialEntries: [path] }
  );
  render(
    <LoggingProvider value={logging}>
      <IframeModeProvider value={iframe}>
        <RouterProvider router={router} />
      </IframeModeProvider>
    </LoggingProvider>
  );
  return { router, logging };
};

describe("useRouterState", () => {
  it("is empty at the editor's root", () => {
    renderAt("/project");
    expect(state()).toEqual({});
  });

  it("reads the tab and slug from the path", () => {
    renderAt("/project/reference/display");
    expect(state()).toEqual({
      tab: "reference",
      slug: { id: "display" },
      focus: false,
    });
  });

  it("ignores unknown tabs", () => {
    renderAt("/project/nonsense/display");
    expect(state()).toEqual({});
  });

  it("treats deeper paths as the editor with no tab", () => {
    renderAt("/project/api/a/b");
    expect(state()).toEqual({});
  });

  it("navigates, carrying focus in history state, and logs the source", async () => {
    const { router, logging } = renderAt("/project");
    await act(async () => {
      setState({ tab: "api", slug: { id: "microbit" }, focus: true }, "code");
    });
    expect(router.state.location.pathname).toEqual("/project/api/microbit");
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

  it("keeps the editor at the root in iframe mode", async () => {
    const { router } = renderAt("/reference/display", true);
    expect(state()).toEqual({
      tab: "reference",
      slug: { id: "display" },
      focus: false,
    });
    await act(async () => {
      setState({ tab: "api", slug: { id: "microbit" } });
    });
    expect(router.state.location.pathname).toEqual("/api/microbit");
  });

  it("does not log without a source", async () => {
    const { logging } = renderAt("/project");
    await act(async () => {
      setState({ tab: "ideas" });
    });
    expect(logging.events).toEqual([]);
  });

  it("gives a new state object when navigating to the same anchor again", async () => {
    renderAt("/project/reference/display");
    const before = state();
    await act(async () => {
      setState({ tab: "reference", slug: { id: "display" } });
    });
    expect(state()).not.toBe(before);
    expect(state()).toEqual(before);
  });
});
