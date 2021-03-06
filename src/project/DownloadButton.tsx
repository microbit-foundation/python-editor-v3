import React, { useCallback } from "react";
import { RiDownload2Line } from "react-icons/ri";
import useActionFeedback from "../common/use-action-feedback";
import { DownloadData } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";
import CollapsableButton, {
  CollapsibleButtonProps,
} from "../common/CollapsibleButton";

interface DownloadButtonProps
  extends Omit<CollapsibleButtonProps, "onClick" | "text" | "icon"> {}

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
    let download: DownloadData | undefined;
    try {
      download = await fs.toHexForDownload();
    } catch (e) {
      actionFeedback.expectedError({
        title: "Failed to build the hex file",
        description: e.message,
      });
      return;
    }
    const blob = new Blob([download.intelHex], {
      type: "application/octet-stream",
    });
    saveAs(blob, `${download.filename}.hex`);
  }, [fs, actionFeedback]);

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
