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
      bgColor={highlight ? "blimpTeal.300" : "blimpTeal.50"}
      transition="background .2s"
    >
      <DragHandleIcon
        boxSize={3}
        color={highlight ? "blimpTeal.600" : "blimpTeal.300"}
        transition="color .2s"
      />
    </HStack>
  );
};

export default DragHandle;
