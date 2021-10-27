import { useCallback, useEffect, useState } from "react";

export interface NavigationState {
  tab?: string;
  advanced?: string;
}

const parse = (search: string): NavigationState => {
  const params = new URLSearchParams(search);
  return {
    tab: params.get("tab") ?? undefined,
    advanced: params.get("advanced") ?? undefined,
    // other tabs will get state here in time, as well as the active file
  };
};

const useNavigationState = (): [
  NavigationState,
  (state: NavigationState) => void
] => {
  const [state, setState] = useState(parse(window.location.search));
  useEffect(() => {
    const listener = (_: PopStateEvent) => {
      setState(parse(window.location.search));
    };
    window.addEventListener("popstate", listener);
    return () => {
      window.removeEventListener("popstate", listener);
    };
  }, []);
  const navigate = useCallback(
    (newState: NavigationState) => {
      const query = Object.entries(newState)
        .filter(([_, v]) => !!v)
        .map(([k, v]) => {
          return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        })
        .join("&");
      const url =
        window.location.toString().split("?")[0] + (query ? "?" + query : "");
      window.history.pushState(newState, "", url);

      setState(newState);
    },
    [setState]
  );

  return [state, navigate];
};

export const useNavigationParameter = (
  param: keyof NavigationState
): [string | undefined, (param: string | undefined) => void] => {
  const [state, setState] = useNavigationState();
  const navigateParam = (value: string | undefined) => {
    console.log("Updating parameter to ", value, " others", state);
    setState({ ...state, [param]: value });
  };
  return [state[param], navigateParam];
};

export default useNavigationState;
