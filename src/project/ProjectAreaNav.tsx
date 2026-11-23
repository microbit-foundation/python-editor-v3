/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, VStack } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import AddFilesButton from "./AddFilesButton";
import NewButton from "./NewButton";

interface ProjectAreaNavProps {
  css?: SystemStyleObject;
}

const ProjectAreaNav = ({ css: cssProp }: ProjectAreaNavProps) => {
  return (
    <Flex css={cssProp} direction="column" alignItems="center" p="5" pb="6">
      <VStack alignItems="stretch" gap="3">
        <NewButton mode="button" />
        <AddFilesButton mode="button" />
      </VStack>
    </Flex>
  );
};

export default ProjectAreaNav;
