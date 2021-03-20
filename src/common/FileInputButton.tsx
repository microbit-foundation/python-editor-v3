import { Button, ButtonProps, Input } from "@chakra-ui/react";
import React, { useCallback, useRef } from "react";
import { RiFolderOpenLine } from "react-icons/ri";

interface OpenButtonProps extends ButtonProps {
  onOpen: (file: File) => void;
  /**
   * File input tag accept attribute.
   */
  accept?: string;
}

/**
 * File open button, with an associated input field.
 */
const FileInputButton = ({
  accept,
  onOpen,
  leftIcon = <RiFolderOpenLine />,
  children,
  ...props
}: OpenButtonProps) => {
  const ref = useRef<HTMLInputElement>(null);

  const handleChooseFile = useCallback(() => {
    ref.current && ref.current.click();
  }, []);

  const handleOpenFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const file = files.item(0);
        // Clear the input so we're triggered if the user opens the same file again.
        ref.current!.value = "";
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
        ref={ref}
      />
      <Button
        leftIcon={<RiFolderOpenLine />}
        onClick={handleChooseFile}
        {...props}
      >
        {children}
      </Button>
    </>
  );
};

export default FileInputButton;
