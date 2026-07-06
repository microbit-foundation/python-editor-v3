/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex, VStack } from "@chakra-ui/react";
import NewButton from "./NewButton";
import OpenButton from "./OpenButton";

const ProjectAreaNav = (props: BoxProps) => {
  return (
    <Flex {...props} direction="column" alignItems="center" p={5} pb={6}>
      <VStack alignItems="stretch" spacing={3}>
        <NewButton mode="button" />
        <OpenButton mode="button" />
      </VStack>
    </Flex>
  );
};

export default ProjectAreaNav;
