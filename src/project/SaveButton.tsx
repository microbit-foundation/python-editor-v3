/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip } from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import { RiDownload2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsibleButton, {
  CollapsibleButtonProps,
} from "../common/CollapsibleButton";
import { useProjectActions } from "./project-hooks";
import { useHotkeys } from "react-hotkeys-hook";
import {
  globalShortcutConfig,
  keyboardShortcuts,
} from "../common/keyboard-shortcuts";

interface SaveButtonProps
  extends Omit<CollapsibleButtonProps, "onClick" | "text" | "icon"> {}

/**
 * Save HEX button.
 *
 * This is the main action for programming the micro:bit if the
 * system does not support WebUSB.
 *
 * Otherwise it's a more minor action.
 */
const SaveButton = (props: SaveButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);
  const handleSave = useCallback(() => {
    activeElementRef.current = document.activeElement as HTMLElement;
    actions.save(activeElementRef);
  }, [actions]);
  useHotkeys(keyboardShortcuts.saveProject, handleSave, globalShortcutConfig);
  return (
    <Tooltip
      hasArrow
      placement="top-start"
      label={intl.formatMessage({
        id: "save-hover",
      })}
    >
      <CollapsibleButton
        ref={menuButtonRef}
        {...props}
        icon={<RiDownload2Line />}
        onClick={() => actions.save(menuButtonRef)}
        text={intl.formatMessage({
          id: "save-action",
        })}
      />
    </Tooltip>
  );
};

export default SaveButton;
