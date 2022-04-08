/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { FormattedMessage } from "react-intl";
import IdeaToolkit from "./ideas/IdeaToolkit";
import ToolkitSpinner from "./reference/ToolkitSpinner";
import { useToolkitState } from "./toolkit-hooks";

const IdeasArea = () => {
  const { ideasToolkit } = useToolkitState();
  switch (ideasToolkit.status) {
    case "loading":
      return <ToolkitSpinner />;
    case "error":
      return (
        <Text p={5} height="100%">
          <FormattedMessage id="toolkit-error-loading" />
        </Text>
      );
    case "ok":
      return <IdeaToolkit toolkit={ideasToolkit.toolkit} />;
    default:
      throw new Error();
  }
};

export default IdeasArea;
