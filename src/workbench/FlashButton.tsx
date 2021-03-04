import React, { useCallback, useState } from "react";
import { RiFlashlightFill } from "react-icons/ri";
import Separate from "../common/Separate";
import useActionFeedback, {
  ActionFeedback,
} from "../common/use-action-feedback";
import { WebUSBError } from "../device";
import { BoardId } from "../device/board-id";
import { useConnectionStatus, useDevice } from "../device/device-hooks";
import { useFileSystem } from "../fs/fs-hooks";
import CollapsableButton, { CollapsableButtonProps } from "./CollapsableButton";

class HexGenerationError extends Error {}

/**
 * Flash button.
 */
const FlashButton = (
  props: Omit<CollapsableButtonProps, "onClick" | "text" | "icon">
) => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const device = useDevice();
  const connected = useConnectionStatus();
  const [progress, setProgress] = useState<number | undefined>();

  const handleFlash = useCallback(async () => {
    const dataSource = async (boardId: BoardId) => {
      try {
        return await fs.toHexForFlash(boardId);
      } catch (e) {
        throw new HexGenerationError(e.message);
      }
    };

    try {
      await device.flash(dataSource, { partial: true, progress: setProgress });
    } catch (e) {
      if (e instanceof HexGenerationError) {
        actionFeedback.expectedError({
          title: "Failed to build the hex file",
          description: e.message,
        });
      } else {
        handleWebUSBError(actionFeedback, e);
      }
    }
  }, [fs, device, actionFeedback]);
  const text =
    typeof progress === "undefined"
      ? "Flash"
      : `Flashing… (${(progress * 100).toFixed(0)}%)`;
  return (
    <CollapsableButton
      {...props}
      disabled={!fs || !connected || typeof progress !== "undefined"}
      icon={<RiFlashlightFill />}
      onClick={handleFlash}
      text={text}
    />
  );
};

const handleWebUSBError = (actionFeedback: ActionFeedback, e: any) => {
  if (e instanceof WebUSBError) {
    actionFeedback.expectedError({
      title: e.title,
      description: (
        <Separate separator={(k) => <br key={k} />}>
          {[e.message, e.description].filter(Boolean)}
        </Separate>
      ),
    });
  } else {
    actionFeedback.unexpectedError(e);
  }
};

export default FlashButton;
