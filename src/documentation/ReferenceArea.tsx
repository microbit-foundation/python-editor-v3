/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { FormattedMessage } from "react-intl";
import ReferenceToolkit from "./reference/ReferenceDocumentation";
import Spinner from "../common/Spinner";
import { useDocumentation } from "./documentation-hooks";

const ReferenceArea = () => {
  const { reference } = useDocumentation();
  switch (reference.status) {
    case "loading":
      return <Spinner />;
    case "error":
      return (
        <Text p={5} height="100%">
          <FormattedMessage id="toolkit-error-loading" />
        </Text>
      );
    case "ok":
      return <ReferenceToolkit toolkit={reference.content} />;
    default:
      throw new Error();
  }
};

export default ReferenceArea;
