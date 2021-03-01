import { Box } from "@chakra-ui/react";
import React from "react";

/**
 * A gradient strip used for visual separation.
 */
const GradientLine = () => (
  <Box
    width="100%"
    maxHeight="100%"
    height="10px"
    backgroundImage="linear-gradient(90deg,#00c800,#3eb6fd);"
  />
);

export default GradientLine;
