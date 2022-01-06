/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack } from "@chakra-ui/layout";
import { DragHandleIcon } from "@chakra-ui/icons";

interface DragHandleProps extends BoxProps {}

const DragHandle = (props: DragHandleProps) => {
  return (
    <HStack {...props} bgColor="blackAlpha.100">
      <DragHandleIcon boxSize={3} />
    </HStack>
  );
};

export default DragHandle;
