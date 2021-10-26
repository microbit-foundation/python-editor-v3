import { Box, BoxProps, VStack } from "@chakra-ui/layout";
import { ReactNode } from "react";

interface ToolkitLevelProps extends BoxProps {
  heading: ReactNode;
  children: ReactNode;
}

const ToolkitLevel = ({ heading, children, ...props }: ToolkitLevelProps) => (
  <VStack justifyContent="stretch" spacing={0} {...props}>
    <Box
      minHeight="28"
      backgroundColor="rgb(230, 232, 239)"
      flex="0 0 auto"
      width="100%"
      p={3}
      pl={5}
      pr={5}
    >
      {heading}
    </Box>
    {children}
  </VStack>
);

export default ToolkitLevel;
