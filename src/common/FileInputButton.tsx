/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip } from "@microbit/ui";
import React, { ForwardedRef, useCallback, useRef } from "react";
import CollapsibleButton, { CollapsibleButtonProps } from "./CollapsibleButton";

interface FileInputButtonProps extends Omit<CollapsibleButtonProps, "icon"> {
  onOpen: (file: File[]) => void;
  icon: React.ReactElement;
  /**
   * File input tag accept attribute.
   */
  accept?: string;
  multiple?: boolean;
  tooltip?: string;
  "data-testid"?: string;
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
      tooltip,
      "data-testid": dataTestId,
      ...props
    }: FileInputButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChooseFile = useCallback(() => {
      inputRef.current?.click();
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

    const button = (
      <CollapsibleButton
        ref={ref}
        icon={icon}
        onPress={handleChooseFile}
        data-testid={dataTestId}
        {...props}
      />
    );
    return (
      <>
        {tooltip ? (
          <Tooltip hasArrow placement="top start" label={tooltip}>
            {button}
          </Tooltip>
        ) : (
          button
        )}
        <input
          data-testid={dataTestId ? dataTestId + "-input" : undefined}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          multiple={multiple}
          onChange={handleOpenFile}
          ref={inputRef}
        />
      </>
    );
  }
);

export default FileInputButton;
