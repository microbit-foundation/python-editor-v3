/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Box, BoxProps, HStack } from "@chakra-ui/layout";
import { Portal } from "@chakra-ui/portal";
import { forwardRef } from "@chakra-ui/system";
import {
  Ref,
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RiDownloadFill } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import { useSplitViewContext } from "../../common/SplitView/context";
import { useActiveEditorActions } from "../../editor/active-editor-hooks";
import CodeMirrorView from "../../editor/codemirror/CodeMirrorView";
import { debug as dndDebug, setDragContext } from "../../editor/codemirror/dnd";
import { useLogging } from "../../logging/logging-hooks";
import { useScrollablePanelAncestor } from "../../workbench/ScrollablePanel";
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
  const codePopUpHeight = `calc(${codeHeight} + 2px)`; // Account for border.
  const handleMouseEnter = useCallback(() => setState("raised"), [setState]);
  const handleMouseLeave = useCallback(() => setState("default"), [setState]);
  const handleInsertCode = useCallback(
    () => actions?.insertCode(codeWithImports),
    [actions, codeWithImports]
  );

  return (
    <Box>
      <Box height={codeHeight} fontSize="md">
        <Code
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          concise={code}
          full={codeWithImports}
          position="absolute"
          ref={codeRef}
          background={state === "default" ? "white" : "blimpTeal.50"}
          highlightDragHandle={state === "raised"}
        />
        {state === "raised" && (
          <CodePopUp
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            height={codePopUpHeight}
            width={codeRef.current ? codeRef.current.offsetWidth : "unset"}
            concise={code}
            full={codeWithImports}
            codeRef={codeRef}
            parentSlug={parentSlug}
          />
        )}
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

interface CodePopUpProps extends BoxProps {
  concise: string;
  full: string;
  codeRef: RefObject<HTMLDivElement | null>;
  parentSlug?: string;
}

// We draw the same code over the top in a portal so we can draw it
// above the scrollbar.
const CodePopUp = ({
  codeRef,
  concise,
  full,
  parentSlug,
  ...props
}: CodePopUpProps) => {
  // We need to re-render, we don't need the value.
  useScrollTop();
  useSplitViewContext();
  if (!codeRef.current) {
    return null;
  }

  return (
    <Portal>
      <Code
        concise={concise}
        full={full}
        position="absolute"
        top={codeRef.current.getBoundingClientRect().top + "px"}
        left={codeRef.current.getBoundingClientRect().left + "px"}
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
}

const Code = forwardRef<CodeProps, "pre">(
  (
    { concise, full, highlightDragHandle, parentSlug, ...props }: CodeProps,
    ref
  ) => {
    const logging = useLogging();
    const dragImage = useCodeDragImage();
    const handleDragStart = useCallback(
      (event: React.DragEvent) => {
        logging.event({
          type: "code-drag",
          detail: parentSlug,
        });
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
      [full, dragImage, parentSlug, logging]
    );
    const handleDragEnd = useCallback(
      (event: React.DragEvent) => {
        // This does not indicate a successful drop where code is inserted.
        logging.event({
          type: "code-drag",
          detail: parentSlug,
        });
        dndDebug("dragend");
        setDragContext(undefined);
      },
      [parentSlug, logging]
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

const useScrollTop = () => {
  const scrollableRef = useScrollablePanelAncestor();
  const [scrollTop, setScrollTop] = useState(0);
  useLayoutEffect(() => {
    const scrollable = scrollableRef.current;
    if (!scrollable) {
      throw new Error();
    }
    setScrollTop(scrollable.scrollTop);
    const listener = () => setScrollTop(scrollable.scrollTop);
    scrollable.addEventListener("scroll", listener);
    return () => {
      scrollable.removeEventListener("scroll", listener);
    };
  }, [scrollableRef]);
  return scrollTop;
};

export default CodeEmbed;
