import { Text } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import ToolkitDocumentation from ".";
import useIsUnmounted from "../../common/use-is-unmounted";
import { useLogging } from "../../logging/logging-hooks";
import { fetchToolkit } from "./api";
import { Toolkit } from "./model";
import ToolkitSpinner from "./ToolkitSpinner";

type State =
  | { status: "ok"; toolkit: Toolkit }
  | { status: "error"; error: string }
  | { status: "loading" };

interface ToolkitContainerProps {
  toolkitId: string;
}

const ToolkitContainer = ({ toolkitId }: ToolkitContainerProps) => {
  const [state, setState] = useState<State>({
    status: "loading",
  });
  const logging = useLogging();
  const isUnmounted = useIsUnmounted();
  useEffect(() => {
    const load = async () => {
      try {
        const toolkit = await fetchToolkit(toolkitId);
        if (!isUnmounted()) {
          setState({ status: "ok", toolkit });
        }
      } catch (e) {
        logging.error(e);
        if (!isUnmounted()) {
          setState({
            status: "error",
            error: "TODO pretty translatable error",
          });
        }
      }
    };
    load();
  }, [setState, toolkitId, isUnmounted, logging]);
  switch (state.status) {
    case "loading":
      return <ToolkitSpinner />;
    case "error":
      return <Text>{state.error}</Text>;
    case "ok":
      return <ToolkitDocumentation toolkit={state.toolkit} />;
    default:
      throw new Error();
  }
};

export default ToolkitContainer;
