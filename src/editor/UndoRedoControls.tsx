/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonGroup, IconButton } from "@chakra-ui/react";
import { RiZoomInLine, RiZoomOutLine } from "react-icons/ri";

const UndoRedoControls = ({ ...props }) => {
  return (
    <ButtonGroup
      {...props}
      isAttached
      colorScheme="gray"
      variant="zoom"
      transform="rotate(90deg)"
      transformOrigin="bottom"
    >
      <IconButton
        isRound
        icon={<RiZoomInLine style={{ transform: "rotate(-90deg)" }} />}
        aria-label="Undo"
      />
      <IconButton
        isRound
        borderLeft="1px"
        borderLeftColor="gray.10"
        icon={<RiZoomOutLine style={{ transform: "rotate(-90deg)" }} />}
        aria-label="Redo"
      />
    </ButtonGroup>
  );
};

export default UndoRedoControls;
