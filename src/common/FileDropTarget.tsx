import { Box, BoxProps } from "@chakra-ui/layout";
import { ReactNode, useCallback } from "react";

interface FileDropTargetProps extends BoxProps {
  children: ReactNode;
  onFileDrop: (file: File) => void;
}

const FileDropTarget = ({
  children,
  onFileDrop,
  ...props
}: FileDropTargetProps) => {
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      const file = event.dataTransfer.files[0];
      if (file) {
        event.preventDefault();
        event.stopPropagation();
        onFileDrop(file);
      }
    },
    [onFileDrop]
  );
  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);
  return (
    <Box {...props} onDrop={handleDrop} onDragOver={handleDragOver}>
      {children}
    </Box>
  );
};

export default FileDropTarget;
