import { Input } from "@chakra-ui/react";
import React, { ForwardedRef, useCallback, useRef } from "react";
import CollapsableButton, { CollapsibleButtonProps } from "./CollapsibleButton";

interface FileInputButtonProps extends CollapsibleButtonProps {
  onOpen: (file: File) => void;
  /**
   * File input tag accept attribute.
   */
  accept?: string;
}

/**
 * File open button, with an associated input field.
 */
const FileInputButton = React.forwardRef(
  (
    { accept, onOpen, icon, children, ...props }: FileInputButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChooseFile = useCallback(() => {
      inputRef.current && inputRef.current.click();
    }, []);

    const handleOpenFile = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
          const file = files.item(0);
          // Clear the input so we're triggered if the user opens the same file again.
          inputRef.current!.value = "";
          if (file) {
            onOpen(file);
          }
        }
      },
      [onOpen]
    );

    return (
      <>
        <Input
          data-testid={
            (props as any)["data-testid"]
              ? (props as any)["data-testid"] + "-input"
              : undefined
          }
          type="file"
          accept={accept}
          display="none"
          onChange={handleOpenFile}
          ref={inputRef}
        />
        <CollapsableButton
          ref={ref}
          icon={icon}
          onClick={handleChooseFile}
          {...props}
        >
          {children}
        </CollapsableButton>
      </>
    );
  }
);

export default FileInputButton;
