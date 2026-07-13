/**
 * Editor routing.
 *
 * The different UI areas (documentation tabs, drill-down anchors) encode some
 * of their state in the URL. This used to be a bespoke router; it is now a thin
 * compatibility layer over react-router so the rest of the app can keep using
 * the same [state, setState] API.
 *
 * The editor lives under `/project` with tabs at `/project/<tab>` and
 * documentation anchors at `/project/<tab>/<slug>`.
 *
 * (c) 2021-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "./base";
import { useLogging } from "./logging/logging-hooks";

export type TabName = "api" | "ideas" | "reference" | "files";

const tabNames: TabName[] = ["api", "ideas", "reference", "files"];

const isTabName = (value: string | undefined): value is TabName =>
  !!value && (tabNames as string[]).includes(value);

/**
 * An anchor-like navigation used for scroll positions.
 *
 * We sync to on first load, allow drift when you scroll, and, importantly,
 * will scroll again if you set a new anchor with the same id.
 */
export interface Anchor {
  id: string;
}

export interface RouterState {
  tab?: TabName;
  slug?: Anchor;
  focus?: boolean;
}

type NavigationSource =
  | "documentation-user"
  | "documentation-search"
  | "documentation-from-code"
  | "documentation-from-simulator";

type RouterContextValue = [
  RouterState,
  (state: RouterState, source?: NavigationSource) => void
];

export const editorBasePath = "/project";

const buildEditorPath = (state: RouterState): string => {
  const parts = [state.tab, state.slug?.id].filter(
    (x): x is string => !!x
  );
  return [editorBasePath, ...parts].join("/");
};

/**
 * Build a full href (including the app base URL) for a router state.
 * Used for link targets; navigation itself goes through the router.
 */
export const toUrl = (state: RouterState): string =>
  baseUrl + buildEditorPath(state).replace(/^\//, "");

/**
 * The full router state.
 * Consider using useRouterTabSlug instead if you only care about one parameter.
 *
 * Updating the state updates the URL.
 *
 * @return a [state, setState] pair.
 */
export const useRouterState = (): RouterContextValue => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const logging = useLogging();

  const tab = isTabName(params.tab) ? params.tab : undefined;
  const slugId = params.slug;
  const focus = (location.state as { focus?: boolean } | null)?.focus ?? false;
  // Tie identity to location.key so that navigating to the same anchor again
  // (e.g. clicking the same search result twice) produces a fresh state object
  // and re-triggers scroll/focus effects, matching the previous behaviour.
  const state = useMemo<RouterState>(
    () => ({
      tab,
      slug: slugId ? { id: slugId } : undefined,
      focus,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, slugId, focus, location.key]
  );

  const setState = useCallback(
    (newState: RouterState, source?: NavigationSource) => {
      if (source) {
        const parts = [newState.tab, newState.slug?.id].filter(
          (x): x is string => !!x
        );
        logging.event({
          type: source,
          message: parts.join("-"),
        });
      }
      navigate(buildEditorPath(newState), {
        state: { focus: newState.focus },
      });
    },
    [logging, navigate]
  );

  return [state, setState];
};

/**
 * Access the slug for a particular tab.
 *
 * @param tab The tab name.
 * @returns A [state, setState] pair for the tab.
 */
export const useRouterTabSlug = (
  tab: TabName
): [
  Anchor | undefined,
  (param: Anchor | undefined, source?: NavigationSource) => void
] => {
  const [state, setState] = useRouterState();
  const navigateParam = useCallback(
    (value: Anchor | undefined, source?: NavigationSource) => {
      setState({ ...state, tab, slug: value }, source);
    },
    [tab, setState, state]
  );
  return [state.tab === tab ? state.slug : undefined, navigateParam];
};
