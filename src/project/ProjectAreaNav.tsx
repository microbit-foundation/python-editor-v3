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
    <Flex {...props} direction="column" alignItems="center" p={5} pb={6}>
      <VStack alignItems="stretch" spacing={3}>
        <NewButton mode="button" />
        <OpenButton mode="button" />
        <Box>
          {/* warning = the red outline that Chakra's outline + red
              colorScheme resolved to. */}
          <ResetButton mode="button" variant="warning" css={{ mt: "5" }} />
        </Box>
      </VStack>
    </Flex>
  );
};

export default ProjectAreaNav;
