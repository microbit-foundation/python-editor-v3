/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { FormattedMessage } from "react-intl";
import ReferenceToolkit from "./reference/ReferenceToolkit";
import ToolkitSpinner from "./reference/ToolkitSpinner";
import { useToolkitState } from "./toolkit-hooks";

const ReferenceArea = () => {
  const { referenceToolkit } = useToolkitState();
  switch (referenceToolkit.status) {
    case "loading":
      return <ToolkitSpinner />;
    case "error":
      return (
        <Text p={5} height="100%">
          <FormattedMessage id="toolkit-error-loading" />
        </Text>
      );
    case "ok":
      return <ReferenceToolkit toolkit={referenceToolkit.toolkit} />;
    default:
      throw new Error();
  }
};

export default ReferenceArea;
