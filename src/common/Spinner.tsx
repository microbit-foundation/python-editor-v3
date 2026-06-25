/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Spinner as ChakraSpinner } from "@chakra-ui/react";
import { useIntl } from "react-intl";

const Spinner = () => {
  const intl = useIntl();
  return (
    <Box height="100%">
      <ChakraSpinner
        display="block"
        ml="auto"
        mr="auto"
        mt={2}
        label={intl.formatMessage({ id: "loading" })}
      />
    </Box>
  );
};

export default Spinner;
