/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex, VStack } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import NewButton from "./NewButton";
import OpenButton from "./OpenButton";
import ResetButton from "./ResetButton";

interface ProjectAreaNavProps {
  css?: SystemStyleObject;
}

const ProjectAreaNav = ({ css: cssProp }: ProjectAreaNavProps) => {
  return (
    <Flex css={cssProp} direction="column" alignItems="center" p="5" pb="6">
      <VStack alignItems="stretch" gap="3">
        <NewButton mode="button" />
        <OpenButton mode="button" />
        <Box>
          <ResetButton mode="button" variant="warning" css={{ mt: "5" }} />
        </Box>
      </VStack>
    </Flex>
  );
};

export default ProjectAreaNav;
