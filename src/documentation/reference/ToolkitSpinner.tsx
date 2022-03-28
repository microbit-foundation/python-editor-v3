/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/spinner";
import { useIntl } from "react-intl";

const ToolkitSpinner = () => {
  const intl = useIntl();
  return (
    <Box height="100%">
      <Spinner
        display="block"
        ml="auto"
        mr="auto"
        mt={2}
        label={intl.formatMessage({ id: "loading" })}
      />
    </Box>
  );
};

export default ToolkitSpinner;
