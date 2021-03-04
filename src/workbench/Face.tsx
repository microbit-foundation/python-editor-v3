import { Box } from "@chakra-ui/react";
import { ReactComponent as Face } from "./face.svg";

/**
 * The micro:bit logo.
 */
export default () => (
  <Box fill="white" backgroundColor="black">
    <Face height="50px" width="50px" />
  </Box>
);
