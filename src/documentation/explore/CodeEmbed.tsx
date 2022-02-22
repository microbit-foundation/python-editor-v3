/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Box, BoxProps, HStack } from "@chakra-ui/layout";
import { Portal } from "@chakra-ui/portal";
import { forwardRef } from "@chakra-ui/system";
import { Ref, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RiDownloadFill } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import { useScrollablePanelAncestor } from "../../common/ScrollablePanel";
import { zIndexCodePopUp } from "../../common/zIndex";
import { useActiveEditorActions } from "../../editor/active-editor-hooks";
import CodeMirrorView from "../../editor/codemirror/CodeMirrorView";
import { debug as dndDebug, setDragContext } from "../../editor/codemirror/dnd";
import { useLogging } from "../../logging/logging-hooks";
import DragHandle from "../common/DragHandle";
import { useCodeDragImage } from "../documentation-hooks";

interface CodeEmbedProps {
  code: string;
  parentSlug?: string;
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

const CodeEmbed = ({ code: codeWithImports, parentSlug }: CodeEmbedProps) => {
  const [state, originalSetState] = useState<CodeEmbedState>("default");
  // We want to debounce raising so that we don't raise very briefly during scroll.
  // We don't ever want to delay other actions.
  const setState = useMemo(() => {
    let timeout: any;
    return (
      newState: CodeEmbedState | undefined,
      immediate: boolean = true
    ) => {
      clearTimeout(timeout);
      if (!newState) {
        // Just clear the timeout.
        return;
      }
      if (immediate) {
        originalSetState(newState);
      } else {
        timeout = setTimeout(() => {
          originalSetState(newState);
        }, 25);
      }
    };
  }, [originalSetState]);
  const toRaised = useCallback(() => setState("raised", false), [setState]);
  const toDefault = useCallback(() => setState("default"), [setState]);
  const toHighlighted = useCallback(() => setState("highlighted"), [setState]);
  const clearPending = useCallback(() => setState(undefined), [setState]);
  useScrollableAncestorScroll(toDefault);

  const actions = useActiveEditorActions();
  const handleInsertCode = useCallback(
    () => actions?.insertCode(codeWithImports, parentSlug),
    [actions, codeWithImports, parentSlug]
  );

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
  const codePopUpHeight = `calc(${codeHeight} + 2px)`; // Account for border.

  return (
    <Box>
      <Box height={codeHeight} fontSize="md">
        <Code
          onMouseEnter={toRaised}
          onMouseLeave={clearPending}
          onCodeDragEnd={toDefault}
          concise={code}
          full={codeWithImports}
          position="absolute"
          ref={codeRef}
          background={state === "default" ? "white" : "blimpTeal.50"}
          highlightDragHandle={state === "raised"}
        />
        {state === "raised" && (
          <CodePopUp
            onMouseLeave={toDefault}
            onCodeDragEnd={toDefault}
            height={codePopUpHeight}
            top={codeRef.current!.getBoundingClientRect().top + "px"}
            left={codeRef.current!.getBoundingClientRect().left + "px"}
            width={codeRef.current!.offsetWidth}
            concise={code}
            full={codeWithImports}
            parentSlug={parentSlug}
          />
        )}
      </Box>
      <HStack spacing={3} mt="2px">
        <Button
          onMouseEnter={toHighlighted}
          onMouseLeave={toDefault}
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

interface CodePopUpProps extends BoxProps {
  concise: string;
  full: string;
  parentSlug?: string;
  onCodeDragEnd: () => void;
}

// We draw the same code over the top in a portal so we can draw it
// above the scrollbar. You can achieve almost the same effect with
// z-index, but Safari draws the scrollbars over the code that should
// be above them.
const CodePopUp = ({ concise, full, parentSlug, ...props }: CodePopUpProps) => {
  return (
    <Portal>
      <Code
        zIndex={zIndexCodePopUp}
        concise={concise}
        full={full}
        position="absolute"
        // We're always "raised" as this is the pop-up.
        background="blimpTeal.50"
        boxShadow="rgba(0, 0, 0, 0.18) 0px 2px 6px"
        highlightDragHandle
        parentSlug={parentSlug}
        {...props}
      />
    </Portal>
  );
};

interface CodeProps extends BoxProps {
  concise: string;
  full: string;
  ref?: Ref<HTMLDivElement>;
  highlightDragHandle: boolean;
  parentSlug?: string;
  onCodeDragEnd: () => void;
}

const Code = forwardRef<CodeProps, "pre">(
  (
    {
      concise,
      full,
      highlightDragHandle,
      parentSlug,
      onCodeDragEnd,
      ...props
    }: CodeProps,
    ref
  ) => {
    const logging = useLogging();
    const dragImage = useCodeDragImage();
    const handleDragStart = useCallback(
      (event: React.DragEvent) => {
        logging.event({
          type: "code-drag",
          message: parentSlug,
        });
        dndDebug("dragstart");
        event.dataTransfer.dropEffect = "copy";
        setDragContext({
          code: full,
          type: "example",
          id: parentSlug,
        });
        event.dataTransfer.setData(pythonSnippetMediaType, full);
        if (dragImage.current) {
          event.dataTransfer.setDragImage(dragImage.current, 0, 0);
        }
      },
      [full, dragImage, parentSlug, logging]
    );
    const handleDragEnd = useCallback(
      (event: React.DragEvent) => {
        onCodeDragEnd();
        dndDebug("dragend");
        setDragContext(undefined);
      },
      [onCodeDragEnd]
    );

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
        cursor="grab"
        {...props}
      >
        <DragHandle
          borderTopLeftRadius="lg"
          p={1}
          alignSelf="stretch"
          highlight={highlightDragHandle}
        />
        <CodeMirrorView
          // If we fix copy and deal with selection sync then we should probably remove this,
          // though it'll make it harder to drag.
          pointerEvents="none"
          value={concise}
          flex="1 0 auto"
          p={5}
          pl={1}
          pt={2}
          pb={2}
          minW={40}
        />
      </HStack>
    );
  }
);

const useScrollableAncestorScroll = (callback: () => void) => {
  const scrollable = useScrollablePanelAncestor();
  useEffect(() => {
    const target = scrollable.current;
    if (target) {
      target.addEventListener("scroll", callback);
      return () => {
        target.removeEventListener("scroll", callback);
      };
    }
  }, [scrollable, callback]);
};

export default CodeEmbed;
