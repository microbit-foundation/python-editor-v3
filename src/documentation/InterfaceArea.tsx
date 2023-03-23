/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { FormattedMessage } from "react-intl";
import IdeasDocumentation from "./ideas/IdeasDocumentation";
import Spinner from "../common/Spinner";
import { useDocumentation } from "./documentation-hooks";

const InterfaceArea = () => {
  const { ideas } = useDocumentation();
  switch (ideas.status) {
    case "loading":
      return <Spinner />;
    case "error":
      return (
        <Text p={5} height="100%">
          <FormattedMessage id="toolkit-error-loading" />
        </Text>
      );
    case "ok":
      return (
        <Text p={5} height="100%">
          <FormattedMessage id="this will be the interface tab :)" />
        </Text>
      );
    default:
      throw new Error();
  }
};

export default InterfaceArea;
