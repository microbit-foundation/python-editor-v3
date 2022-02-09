/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Input, Tooltip } from "@chakra-ui/react";
import React, { ForwardedRef, useCallback, useRef } from "react";
import CollapsibleButton, { CollapsibleButtonProps } from "./CollapsibleButton";

interface FileInputButtonProps extends CollapsibleButtonProps {
  onOpen: (file: File[]) => void;
  /**
   * File input tag accept attribute.
   */
  accept?: string;
  multiple?: boolean;
  tooltip?: string;
}

/**
 * File open button, with an associated input field.
 */
const FileInputButton = React.forwardRef(
  (
    {
      accept,
      multiple,
      onOpen,
      icon,
      children,
      tooltip,
      ...props
    }: FileInputButtonProps,
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
          const filesArray = Array.from(files);
          // Clear the input so we're triggered if the user opens the same file again.
          inputRef.current!.value = "";
          if (filesArray.length > 0) {
            onOpen(filesArray);
          }
        }
      },
      [onOpen]
    );

    return (
      <>
        <Tooltip hasArrow placement="top-start" label={tooltip}>
          <CollapsibleButton
            ref={ref}
            icon={icon}
            onClick={handleChooseFile}
            {...props}
          >
            {children}
          </CollapsibleButton>
        </Tooltip>
        <Input
          data-testid={
            (props as any)["data-testid"]
              ? (props as any)["data-testid"] + "-input"
              : undefined
          }
          type="file"
          accept={accept}
          display="none"
          multiple={multiple}
          onChange={handleOpenFile}
          ref={inputRef}
        />
      </>
    );
  }
);

export default FileInputButton;
