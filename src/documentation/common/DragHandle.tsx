/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack } from "@chakra-ui/layout";
import { DragHandleIcon } from "@chakra-ui/icons";

interface DragHandleProps extends BoxProps {
  highlight: boolean | undefined;
}

const DragHandle = ({ highlight, ...props }: DragHandleProps) => {
  return (
    <HStack
      cursor="grab"
      {...props}
      bgColor={highlight ? "brand2.300" : "brand2.100"}
      transition="background .2s"
    >
      <DragHandleIcon boxSize={3} color="brand2.600" transition="color .2s" />
    </HStack>
  );
};

export default DragHandle;
