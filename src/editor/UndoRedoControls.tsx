/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonGroup, IconButton } from "@chakra-ui/react";
import { RiArrowGoBackLine, RiArrowGoForwardLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import {
  useActiveEditorActions,
  useActiveEditorInfo,
} from "../editor/active-editor-hooks";

const UndoRedoControls = ({ ...props }) => {
  const intl = useIntl();
  const actions = useActiveEditorActions();
  const editorInfo = useActiveEditorInfo();

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
        isDisabled={editorInfo.undo ? false : true}
      />
      <IconButton
        isRound
        borderLeft="1px"
        borderLeftColor="gray.10"
        icon={<RiArrowGoForwardLine style={{ transform: "rotate(-90deg)" }} />}
        aria-label={intl.formatMessage({ id: "redo" })}
        onClick={actions?.redo}
        isDisabled={editorInfo.redo ? false : true}
      />
    </ButtonGroup>
  );
};

export default UndoRedoControls;
