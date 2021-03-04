import {
  BoxProps,
  Button,
  ButtonProps,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import React, { useCallback } from "react";
import { RiDownload2Line } from "react-icons/ri";
import useActionFeedback from "../common/use-action-feedback";
import { useFileSystem } from "../fs/fs-hooks";
import CollapsableButton, { CollapsableButtonProps } from "./CollapsableButton";

interface DownloadButtonProps
  extends Omit<CollapsableButtonProps, "onClick" | "text" | "icon"> {}

/**
 * Download HEX button.
 *
 * This is the main action for programming the micro:bit if the
 * system does not support WebUSB.
 *
 * Otherwise it's a more minor action.
 */
const DownloadButton = (props: DownloadButtonProps) => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const handleDownload = useCallback(async () => {
    let hex: string | undefined;
    try {
      hex = await fs.toHexForDownload();
    } catch (e) {
      actionFeedback.expectedError({
        title: "Failed to build the hex file",
        description: e.message,
      });
      return;
    }
    // TODO: wire up project name
    const projectName = "my-script";
    const blob = new Blob([hex], { type: "application/octet-stream" });
    saveAs(blob, `${projectName}.hex`);
  }, []);

  return (
    <CollapsableButton
      {...props}
      icon={<RiDownload2Line />}
      onClick={handleDownload}
      text="Download"
    />
  );
};

export default DownloadButton;
