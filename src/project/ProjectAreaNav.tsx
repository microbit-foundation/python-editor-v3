/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Flex, VStack } from "@chakra-ui/react";
import NewButton from "./NewButton";
import OpenButton from "./OpenButton";
import ResetButton from "./ResetButton";

const ProjectAreaNav = (props: BoxProps) => {
  return (
    <Flex {...props} direction="column" alignItems="center">
      <VStack alignItems="stretch" spacing={3}>
        <NewButton mode="button" />
        <OpenButton mode="button" />
        <Box>
          <ResetButton mode="button" mt={8} color="#ae1f1f" />
        </Box>
      </VStack>
    </Flex>
  );
};

export default ProjectAreaNav;
