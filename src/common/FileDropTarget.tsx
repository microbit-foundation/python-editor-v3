import { Box, BoxProps, Center } from "@chakra-ui/layout";
import { ReactNode, useCallback, useState } from "react";
import { RiFolderOpenLine } from "react-icons/ri";

interface FileDropTargetProps extends BoxProps {
  children: ReactNode;
  onFileDrop: (file: File) => void;
}

const FileDropTarget = ({
  children,
  onFileDrop,
  ...props
}: FileDropTargetProps) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      setDragOver(false);
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
    const hasFile = Array.from(event.dataTransfer.types).indexOf("Files") >= 0;
    if (hasFile) {
      setDragOver(true);
      event.dataTransfer.dropEffect = "copy";
    }
  }, []);
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    setDragOver(false);
  }, []);
  return (
    <Box
      {...props}
      onDragOver={handleDragOver}
      position="relative"
      height="100%"
    >
      {dragOver && (
        <Center
          data-testid={
            (props as any)["data-testid"]
              ? (props as any)["data-testid"] + "-overlay"
              : undefined
          }
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          position="absolute"
          top={0}
          left={0}
          height="100%"
          width="100%"
          // If it's not on top then we'll get unexpected leave events.
          zIndex={999999}
          backgroundColor="blackAlpha.500"
        >
          <RiFolderOpenLine
            size="25%"
            pointerEvents="none"
            aria-label="Open file when dropped"
            aria-live="assertive"
          />
        </Center>
      )}
      {children}
    </Box>
  );
};

export default FileDropTarget;
