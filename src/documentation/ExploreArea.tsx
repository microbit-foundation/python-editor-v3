/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { FormattedMessage } from "react-intl";
import ExploreToolkit from "./explore/ExploreToolkit";
import ToolkitSpinner from "./explore/ToolkitSpinner";
import { useToolkitState } from "./ToolkitProvider";

const ExploreArea = () => {
  const { exploreToolkit } = useToolkitState();
  switch (exploreToolkit.status) {
    case "loading":
      return <ToolkitSpinner />;
    case "error":
      return (
        <Text p={5} height="100%">
          <FormattedMessage id="toolkit-error-loading" />
        </Text>
      );
    case "ok":
      return <ExploreToolkit toolkit={exploreToolkit.toolkit} />;
    default:
      throw new Error();
  }
};

export default ExploreArea;
