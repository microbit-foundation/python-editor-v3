/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex, VStack } from "@chakra-ui/react";
import AddFilesButton from "./AddFilesButton";
import NewButton from "./NewButton";

const FilesAreaNav = (props: BoxProps) => {
  return (
    <Flex {...props} direction="column" alignItems="center" p={5} pb={6}>
      <VStack alignItems="stretch" spacing={3}>
        <NewButton mode="button" />
        <AddFilesButton mode="button" />
      </VStack>
    </Flex>
  );
};

export default FilesAreaNav;
