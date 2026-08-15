/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonGroup, IconButton } from "@microbit/ui";
import { RiArrowGoBackLine, RiArrowGoForwardLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { SystemStyleObject } from "styled-system/types";
import {
  useActiveEditorActions,
  useActiveEditorInfo,
} from "../editor/active-editor-hooks";

interface UndoRedoControlsProps {
  css?: SystemStyleObject;
}

const UndoRedoControls = ({ css: cssProp }: UndoRedoControlsProps) => {
  const intl = useIntl();
  const actions = useActiveEditorActions();
  const editorInfo = useActiveEditorInfo();

  return (
    <ButtonGroup
      isAttached
      css={{
        transform: "rotate(90deg)",
        transformOrigin: "bottom",
        ...cssProp,
      }}
    >
      <IconButton
        variant="neutral"
        aria-label={intl.formatMessage({ id: "undo" })}
        onPress={actions?.undo}
        isDisabled={editorInfo.undo ? false : true}
      >
        <RiArrowGoBackLine style={{ transform: "rotate(-90deg)" }} />
      </IconButton>
      <IconButton
        variant="neutral"
        css={{ borderLeft: "1px solid", borderLeftColor: "gray.10" }}
        aria-label={intl.formatMessage({ id: "redo" })}
        onPress={actions?.redo}
        isDisabled={editorInfo.redo ? false : true}
      >
        <RiArrowGoForwardLine style={{ transform: "rotate(-90deg)" }} />
      </IconButton>
    </ButtonGroup>
  );
};

export default UndoRedoControls;
