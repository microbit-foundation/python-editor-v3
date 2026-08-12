/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { HStack, styled } from "styled-system/jsx";
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
      <DragHandleIcon />
    </HStack>
  );
};

/**
 * Chakra UI's DragHandleIcon glyph (MIT © Segun Adebayo and contributors):
 * six chunky dots filling the viewBox. react-icons' RiDraggable draws much
 * finer dots at the same rendered size, so the original path is kept.
 */
const DragHandleIcon = () => (
  <styled.svg
    viewBox="0 0 10 10"
    width="3"
    height="3"
    display="inline-block"
    flexShrink={0}
    color="blimpTeal.600"
    transition="color .2s"
    aria-hidden
  >
    <path
      fill="currentColor"
      d="M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z"
    />
  </styled.svg>
);

export default DragHandle;
