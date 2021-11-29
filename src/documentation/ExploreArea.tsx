/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import ToolkitDocumentation from "./ToolkitDocumentation";
import useIsUnmounted from "../common/use-is-unmounted";
import { useLogging } from "../logging/logging-hooks";
import { fetchToolkit } from "./ToolkitDocumentation/api";
import { Toolkit } from "./ToolkitDocumentation/model";
import ToolkitSpinner from "./ToolkitDocumentation/ToolkitSpinner";

type State =
  | { status: "ok"; toolkit: Toolkit }
  | { status: "error" }
  | { status: "loading" };

const ExploreArea = () => {
  const [state, setState] = useState<State>({
    status: "loading",
  });
  const logging = useLogging();
  const isUnmounted = useIsUnmounted();
  useEffect(() => {
    const load = async () => {
      try {
        const toolkit = await fetchToolkit();
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
  }, [setState, isUnmounted, logging]);
  switch (state.status) {
    case "loading":
      return <ToolkitSpinner />;
    case "error":
      return (
        <Text p={5}>
          <FormattedMessage id="toolkit-error-loading" />
        </Text>
      );
    case "ok":
      return <ToolkitDocumentation toolkit={state.toolkit} />;
    default:
      throw new Error();
  }
};

export default ExploreArea;
