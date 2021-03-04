import { Button, ButtonProps } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { RiDownload2Line } from "react-icons/ri";
import useActionFeedback from "../common/use-action-feedback";
import { DownloadData } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";

/**
 * Download HEX button.
 *
 * This is the main action for programming the micro:bit if the
 * system does not support WebUSB.
 *
 * Otherwise it's a more minor action.
 */
const DownloadButton = (props: ButtonProps) => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const handleDownload = useCallback(async () => {
    let hex: DownloadData | undefined;
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
    const blob = new Blob([hex.intelHex], { type: "application/octet-stream" });
    saveAs(blob, hex.filename);
  }, []);

  return (
    <Button leftIcon={<RiDownload2Line />} onClick={handleDownload} {...props}>
      Download
    </Button>
  );
};

export default DownloadButton;
