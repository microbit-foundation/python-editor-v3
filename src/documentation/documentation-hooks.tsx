import { useEffect, useState } from "react";
import useIsUnmounted from "../common/use-is-unmounted";
import { useLogging } from "../logging/logging-hooks";
import { useSettings } from "../settings/settings";
import { fetchToolkit } from "./explore/api";
import { Toolkit } from "./explore/model";

type State =
  | { status: "ok"; toolkit: Toolkit }
  | { status: "error" }
  | { status: "loading" };

export const useExploreToolkit = (): State => {
  const [state, setState] = useState<State>({
    status: "loading",
  });
  const logging = useLogging();
  const isUnmounted = useIsUnmounted();
  const [{ languageId }] = useSettings();
  useEffect(() => {
    const load = async () => {
      try {
        const toolkit = await fetchToolkit(languageId);
        if (!isUnmounted()) {
          setState({ status: "ok", toolkit });
        }
      } catch (e) {
        logging.error(e);
        if (!isUnmounted()) {
          setState({
            status: "error",
          });
        }
      }
    };
    load();
  }, [setState, isUnmounted, logging, languageId]);
  return state;
};
