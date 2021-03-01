import { Button, ButtonProps, useToast } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { RiDownload2Line } from "react-icons/ri";
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
  const toast = useToast();
  const handleDownload = useCallback(async () => {
    let hex: string | undefined;
    try {
      hex = await fs.toHexForDownload();
    } catch (e) {
      toast({
        title: "Failed to build the hex file",
        status: "error",
        description: e.message,
        position: "top",
        isClosable: true,
      });
      return;
    }
    // TODO: wire up project name
    const projectName = "my-script";
    const blob = new Blob([hex], { type: "application/octet-stream" });
    saveAs(blob, `${projectName}.hex`);
  }, []);

  return (
    <Button leftIcon={<RiDownload2Line />} onClick={handleDownload} {...props}>
      Download
    </Button>
  );
};

export default DownloadButton;
