/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import useIsUnmounted from "../common/use-is-unmounted";
import { useLogging } from "../logging/logging-hooks";
import ToolkitDocumentation from "./ToolkitDocumentation";
import { fetchToolkit } from "./ToolkitDocumentation/api";
import { Toolkit } from "./ToolkitDocumentation/model";
import ToolkitSpinner from "./ToolkitDocumentation/ToolkitSpinner";
import { useSettings } from "../settings/settings";

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
  switch (state.status) {
    case "loading":
      return <ToolkitSpinner />;
    case "error":
      return (
        <Text p={5} height="100%">
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
