import { Button, ButtonProps, Input } from "@chakra-ui/react";
import React, { useCallback, useRef } from "react";
import {
  RiDownload2Line,
  RiFolderOpenLine,
  RiUpload2Line,
} from "react-icons/ri";
import useActionFeedback from "../common/use-action-feedback";
import { useFileSystem } from "../fs/fs-hooks";

/**
 * Open HEX button, with an associated input field.
 *
 * Much of this code can be shared with DnD open when we have that.
 */
const OpenButton = (props: ButtonProps) => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const ref = useRef<HTMLInputElement>(null);
  const handleChooseFile = useCallback(() => {
    ref.current && ref.current.click();
  }, [ref.current]);
  const handleOpenFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const file = files.item(0);
        if (file) {
          try {
            const text = await file.text();
            await fs.replaceWithHexContents(text);
          } catch (e) {
            actionFeedback.expectedError({
              title: "Failed to open the hex file",
              description: e.message,
            });
          }
        }
      }
    },
    [fs]
  );

  return (
    <>
      <Input
        type="file"
        accept=".hex"
        display="none"
        onChange={handleOpenFile}
        ref={ref}
      />
      <Button
        leftIcon={<RiFolderOpenLine />}
        onClick={handleChooseFile}
        {...props}
      >
        Open
      </Button>
    </>
  );
};

export default OpenButton;
