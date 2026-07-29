/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon } from "@microbit/ui";
import { RiDraggable } from "react-icons/ri";
import { HStack } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";

interface DragHandleProps {
  highlight: boolean | undefined;
  css?: SystemStyleObject;
}

const DragHandle = ({ highlight, css: cssProp }: DragHandleProps) => {
  return (
    <HStack
      cursor="grab"
      css={cssProp}
      bgColor={highlight ? "blimpTeal.300" : "blimpTeal.100"}
      transition="background .2s"
    >
      <Icon
        as={RiDraggable}
        css={{
          width: "3",
          height: "3",
          color: "blimpTeal.600",
          transition: "color .2s",
        }}
      />
    </HStack>
  );
};

export default DragHandle;
