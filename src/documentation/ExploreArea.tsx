/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { FormattedMessage } from "react-intl";
import { useExploreToolkit } from "./documentation-hooks";
import ExploreToolkit from "./explore/ExploreToolkit";
import ToolkitSpinner from "./explore/ToolkitSpinner";

const ExploreArea = () => {
  const state = useExploreToolkit();
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
      return <ExploreToolkit toolkit={state.toolkit} />;
    default:
      throw new Error();
  }
};

export default ExploreArea;
