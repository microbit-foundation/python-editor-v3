/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { FormattedMessage } from "react-intl";
import InteractionDocumentation from "./interaction/InteractionDocumentation";
import Spinner from "../common/Spinner";
import { useDocumentation } from "./documentation-hooks";

const InteractionArea = () => {
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
      return <Text p={5} height="200%">
      <FormattedMessage id="Interaction" />
    </Text>;
    default:
      throw new Error();
  }
};

export default InteractionArea;
