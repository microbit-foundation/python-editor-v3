/**
 * Editor URL state.
 *
 * The documentation tabs and their drill-down anchors are encoded in the URL
 * so that browser navigation works for them. These hooks are the app's view
 * of that state over react-router.
 *
 * (c) 2021-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useLogging } from "./logging/logging-hooks";
import { createEditorUrl } from "./urls";

export type TabName = "api" | "ideas" | "reference" | "project";

const tabNames: readonly string[] = ["api", "ideas", "reference", "project"];

const isTabName = (value: string | undefined): value is TabName =>
  value !== undefined && tabNames.includes(value);

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

/**
 * How the user reached a documentation page, for the docs_navigate event.
 */
export type NavigationSource = "user" | "search" | "code" | "simulator";

type RouterContextValue = [
  RouterState,
  (state: RouterState, source?: NavigationSource) => void
];

/** Carried in history state rather than the URL. */
interface LocationState {
  focus?: boolean;
}

/**
 * The full router state.
 * Consider using useRouterTabSlug instead if you only care about one parameter.
 *
 * Updating the state updates the URL.
 *
 * @return a [state, setState] pair.
 */
export const useRouterState = (): RouterContextValue => {
  const { tab, slug } = useParams<"tab" | "slug">();
  const location = useLocation();
  const navigate = useNavigate();
  const logging = useLogging();

  const focus = (location.state as LocationState | null)?.focus ?? false;
  const state = useMemo<RouterState>(
    () =>
      isTabName(tab)
        ? { tab, slug: slug ? { id: slug } : undefined, focus }
        : {},
    // location.key: navigating to the current anchor again must produce a new
    // state object so that the scroll and focus effects run again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, slug, focus, location.key]
  );

  const setState = useCallback(
    (newState: RouterState, source?: NavigationSource) => {
      if (source) {
        logging.event({
          type: "docs_navigate",
          detail: { via: source, surface: newState.tab, id: newState.slug?.id },
        });
      }
      const locationState: LocationState = { focus: newState.focus };
      void navigate(createEditorUrl(newState), { state: locationState });
    },
    [logging, navigate]
  );

  return useMemo(() => [state, setState], [state, setState]);
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
