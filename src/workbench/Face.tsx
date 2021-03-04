import { Box } from "@chakra-ui/react";
import { ReactComponent as Face } from "./face.svg";

/**
 * The micro:bit logo.
 */
export default () => (
  <Box fill="white" backgroundColor="black" padding="5px">
    <Face height="40px" width="40px" />
  </Box>
);
