import { Button, ButtonProps, Input } from "@chakra-ui/react";
import React, { useCallback, useRef } from "react";
import { RiFolderOpenLine } from "react-icons/ri";
import { useProjectActions } from "./project-hooks";

interface OpenButtonProps extends ButtonProps {
  text?: string;
}

/**
 * Open HEX button, with an associated input field.
 */
const OpenButton = ({ text = "Open", ...props }: OpenButtonProps) => {
  const actions = useProjectActions();
  const ref = useRef<HTMLInputElement>(null);

  const handleChooseFile = useCallback(() => {
    ref.current && ref.current.click();
  }, []);

  const handleOpenFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      console.log(files);
      if (files) {
        const file = files.item(0);
        // Clear the input so we're triggered if the user opens the same file again.
        ref.current!.value = "";
        if (file) {
          await actions.open(file);
        }
      }
    },
    [actions]
  );

  return (
    <>
      <Input
        data-testid="open-input"
        type="file"
        // .mpy isn't supported but better to explain ourselves
        accept=".hex, .py, .mpy"
        display="none"
        onChange={handleOpenFile}
        ref={ref}
      />
      <Button
        leftIcon={<RiFolderOpenLine />}
        onClick={handleChooseFile}
        {...props}
      >
        {text}
      </Button>
    </>
  );
};

export default OpenButton;
