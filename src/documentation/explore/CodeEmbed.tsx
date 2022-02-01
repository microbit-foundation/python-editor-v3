/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Box, BoxProps, HStack } from "@chakra-ui/layout";
import { forwardRef } from "@chakra-ui/system";
import { Ref, useCallback, useMemo, useRef, useState } from "react";
import { RiDownloadFill } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import { useActiveEditorActions } from "../../editor/active-editor-hooks";
import CodeMirrorView from "../../editor/codemirror/CodeMirrorView";
import { debug as dndDebug, setDragContext } from "../../editor/codemirror/dnd";
import DragHandle from "../common/DragHandle";
import { useCodeDragImage } from "../documentation-hooks";

interface CodeEmbedProps {
  code: string;
}

type CodeEmbedState =
  /**
   * Default state.
   */
  | "default"
  /**
   * Highlighted state when hovering "Insert code".
   */
  | "highlighted"
  /**
   * Raised state on mouse over.
   */
  | "raised";

const CodeEmbed = ({ code: codeWithImports }: CodeEmbedProps) => {
  const actions = useActiveEditorActions();
  const [state, setState] = useState<CodeEmbedState>("default");
  const code = useMemo(
    () =>
      codeWithImports
        .split("\n")
        .filter((line) => line !== "from microbit import *")
        // Collapse repeated blank lines to save space. Two blank lines after imports
        // is conventional but a big waste of space here.
        .filter(
          (line, index, array) =>
            index === 0 || !(line.length === 0 && array[index - 1].length === 0)
        )
        .join("\n")
        .trim(),
    [codeWithImports]
  );

  const lineCount = code.trim().split("\n").length;
  const codeRef = useRef<HTMLDivElement>(null);
  const textHeight = lineCount * 1.375 + "em";
  const codeHeight = `calc(${textHeight} + var(--chakra-space-2) + var(--chakra-space-2))`;
  const [codeTop, setCodeTop] = useState<string | undefined>(undefined);
  const handleMouseEnter = useCallback(() => {
    setState("raised");
    setCodeTop(codeRef.current!.getBoundingClientRect().top + "px");
  }, [setState]);
  const handleMouseLeave = useCallback(() => {
    setState("default");
    setCodeTop(undefined);
  }, [setState]);
  const handleInsertCode = useCallback(
    () => actions?.insertCode(codeWithImports),
    [actions, codeWithImports]
  );

  return (
    <Box>
      <Box
        height={codeHeight}
        fontSize="md"
        position={codeTop ? "static" : "relative"}
      >
        <Code
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          concise={code}
          full={codeWithImports}
          position="absolute"
          ref={codeRef}
          background={state === "default" ? "white" : "blimpTeal.50"}
          highlightDragHandle={state === "raised"}
          zIndex={1}
          top={codeTop}
        />
      </Box>
      <HStack spacing={3} mt="2px">
        <Button
          onMouseEnter={() => setState("highlighted")}
          onMouseLeave={() => setState("default")}
          fontWeight="normal"
          color="gray.800"
          border="none"
          bgColor={state === "highlighted" ? "blimpTeal.300" : "blimpTeal.100"}
          borderTopRadius="0"
          borderBottomRadius="lg"
          ml={5}
          variant="ghost"
          size="sm"
          onClick={handleInsertCode}
          rightIcon={<Box as={RiDownloadFill} transform="rotate(270deg)" />}
        >
          <FormattedMessage id="insert-code-action" />
        </Button>
      </HStack>
    </Box>
  );
};

interface CodeProps extends BoxProps {
  concise: string;
  full: string;
  ref?: Ref<HTMLDivElement>;
  highlightDragHandle: boolean;
}

const Code = forwardRef<CodeProps, "pre">(
  ({ concise, full, highlightDragHandle, ...props }: CodeProps, ref) => {
    const dragImage = useCodeDragImage();
    const handleDragStart = useCallback(
      (event: React.DragEvent) => {
        dndDebug("dragstart");
        event.dataTransfer.dropEffect = "copy";
        setDragContext({
          code: full,
          type: "example",
        });
        event.dataTransfer.setData(pythonSnippetMediaType, full);
        if (dragImage.current) {
          event.dataTransfer.setDragImage(dragImage.current, 0, 0);
        }
      },
      [full, dragImage]
    );
    const handleDragEnd = useCallback((event: React.DragEvent) => {
      dndDebug("dragend");
      setDragContext(undefined);
    }, []);

    return (
      <HStack
        draggable
        transition="background .2s, box-shadow .2s"
        borderWidth="1px"
        borderColor="blimpTeal.300"
        borderRadius="lg"
        fontFamily="code"
        overflow="hidden"
        ref={ref}
        spacing={0}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        {...props}
      >
        <DragHandle
          borderTopLeftRadius="lg"
          p={1}
          alignSelf="stretch"
          highlight={highlightDragHandle}
        />
        <CodeMirrorView value={concise} p={5} pl={1} pt={2} pb={2} minW={40} />
      </HStack>
    );
  }
);

export default CodeEmbed;
