/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonGroup, IconButton } from "@chakra-ui/react";
import { RiArrowGoForwardLine, RiArrowGoBackLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { useActiveEditorActions } from "../editor/active-editor-hooks";
import { useUndoRedo } from "../editor/undo-redo-hooks";

const UndoRedoControls = ({ ...props }) => {
  const intl = useIntl();
  const actions = useActiveEditorActions();
  const [undoRedo] = useUndoRedo();
  console.log(undoRedo);

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
        icon={<RiArrowGoBackLine style={{ transform: "rotate(-90deg)" }} />}
        aria-label={intl.formatMessage({ id: "undo" })}
        onClick={actions?.undo}
        disabled={undoRedo.undo ? false : true}
      />
      <IconButton
        isRound
        borderLeft="1px"
        borderLeftColor="gray.10"
        icon={<RiArrowGoForwardLine style={{ transform: "rotate(-90deg)" }} />}
        aria-label={intl.formatMessage({ id: "redo" })}
        onClick={actions?.redo}
        disabled={undoRedo.redo ? false : true}
      />
    </ButtonGroup>
  );
};

export default UndoRedoControls;
