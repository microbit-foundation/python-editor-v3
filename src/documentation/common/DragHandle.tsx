/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack } from "@chakra-ui/layout";
import { DragHandleIcon } from "@chakra-ui/icons";

interface DragHandleProps extends BoxProps {
  highlighted: boolean | undefined;
}

const DragHandle = ({ highlighted, ...props }: DragHandleProps) => {
  return (
    <HStack
      {...props}
      bgColor={highlighted ? "#95D7CE" : "#e9f6f5"} //brand color?
      transition="background .2s"
    >
      <DragHandleIcon
        boxSize={3}
        color={highlighted ? "#4A7B75" : "#95d7ce"} /*brand color*/
        transition="color .2s"
      />
    </HStack>
  );
};

export default DragHandle;
