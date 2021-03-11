import React, { useCallback, useState } from "react";
import { RiFlashlightFill } from "react-icons/ri";
import Separate from "../common/Separate";
import useActionFeedback, {
  ActionFeedback,
} from "../common/use-action-feedback";
import { ConnectionStatus, WebUSBError } from "../device/device";
import { BoardId } from "../device/board-id";
import { useConnectionStatus, useDevice } from "../device/device-hooks";
import { useFileSystem } from "../fs/fs-hooks";
import CollapsableButton, {
  CollapsibleButtonProps,
} from "../common/CollapsibleButton";
import { Tooltip } from "@chakra-ui/react";
import FlashProgress from "./FlashProgress";

class HexGenerationError extends Error {}

/**
 * Flash button.
 */
const FlashButton = (
  props: Omit<CollapsibleButtonProps, "onClick" | "text" | "icon">
) => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const device = useDevice();
  const status = useConnectionStatus();
  const [progress, setProgress] = useState<number | undefined>();

  const handleFlash = useCallback(async () => {
    if (status === ConnectionStatus.NOT_SUPPORTED) {
      actionFeedback.expectedError({
        title: "WebUSB not supported",
        description: "Download the hex file or try Chrome or Microsoft Edge",
      });
      return;
    }

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
  }, [fs, device, actionFeedback, status]);
  return (
    <>
      <FlashProgress progress={progress} />
      <Tooltip
        hasArrow
        placement="top-start"
        label="Flash the project directly to the micro:bit"
      >
        <CollapsableButton
          {...props}
          disabled={typeof progress !== "undefined"}
          icon={<RiFlashlightFill />}
          onClick={handleFlash}
          text="Flash"
        />
      </Tooltip>
    </>
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
