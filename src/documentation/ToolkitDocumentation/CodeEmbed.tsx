/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { DragHandleIcon } from "@chakra-ui/icons";
import { RiFileTransferLine } from "react-icons/ri";
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
import { FormattedMessage } from "react-intl";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import { useSplitViewContext } from "../../common/SplitView/context";
import { useActiveEditorActions } from "../../editor/active-editor-hooks";
import CodeMirrorView from "../../editor/codemirror/CodeMirrorView";
import { setDraggedCode, debug as dndDebug } from "../../editor/codemirror/dnd";
import { flags } from "../../flags";
import { useScrollablePanelAncestor } from "../../workbench/ScrollablePanel";

interface CodeEmbedProps {
  code: string;
}

const CodeEmbed = ({ code: codeWithImports }: CodeEmbedProps) => {
  const actions = useActiveEditorActions();
  const [hovering, setHovering] = useState(false);
  const [hoverInsertBtn, setHoverInsertBtn] = useState(false);
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
  const textHeight = lineCount * 1.3994140625 + "em";
  const codeHeight = `calc(${textHeight} + var(--chakra-space-2) + var(--chakra-space-2))`;
  const codePopUpHeight = `calc(${codeHeight} + 2px)`; //account for border
  const handleMouseEnter = useCallback(() => {
    setHovering(true);
  }, [setHovering]);
  const handleMouseLeave = useCallback(() => {
    setHovering(false);
  }, [setHovering]);
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
          background={hovering || hoverInsertBtn ? "#E9F6F5" : "white"}
        />
        {hovering && (
          <CodePopUp
            height={codePopUpHeight}
            width={codeRef.current ? codeRef.current.offsetWidth : "unset"}
            setHovering={setHovering}
            concise={code}
            full={codeWithImports}
            codeRef={codeRef}
          />
        )}
      </Box>
      <HStack spacing={3} mt="2px">
        <Button
          onMouseEnter={() => setHoverInsertBtn(true)}
          onMouseLeave={() => setHoverInsertBtn(false)}
          fontWeight="normal"
          color="gray.800"
          border="none"
          bgColor={hoverInsertBtn ? "#95D7CE" : "#CAEBE7"} //unlisted colors
          borderTopRadius="0"
          borderBottomRadius="lg"
          ml={5}
          variant="ghost"
          size="sm"
          onClick={handleInsertCode}
          rightIcon={<RiFileTransferLine />}
        >
          <FormattedMessage id="insert-code-action" />
        </Button>
      </HStack>
    </Box>
  );
};

interface CodePopUpProps extends BoxProps {
  setHovering: (hovering: boolean) => void;
  concise: string;
  full: string;
  codeRef: RefObject<HTMLDivElement | null>;
}

// We draw the same code over the top in a portal so we can draw it
// above the scrollbar.
const CodePopUp = ({
  setHovering,
  codeRef,
  concise,
  full,
  ...props
}: CodePopUpProps) => {
  // We need to re-render, we don't need the value.
  const [bgColor, setBgColor] = useState("white");
  const [boxShadow, setBoxShadow] = useState("none");
  useScrollTop();
  useSplitViewContext();
  const handleMouseEnter = useCallback(() => {
    setHovering(true);
    setBgColor("#E9F6F5");
    setBoxShadow("rgba(0, 0, 0, 0.18) 0px 2px 6px");
  }, [setHovering]);
  const handleMouseLeave = useCallback(() => {
    setHovering(false);
  }, [setHovering]);

  if (!codeRef.current) {
    return null;
  }

  return (
    <Portal>
      <Code
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        concise={concise}
        full={full}
        position="absolute"
        top={codeRef.current.getBoundingClientRect().top + "px"}
        left={codeRef.current.getBoundingClientRect().left + "px"}
        background={bgColor}
        boxShadow={boxShadow}
        {...props}
      />
    </Portal>
  );
};

interface CodeProps extends BoxProps {
  concise: string;
  full: string;
  ref?: Ref<HTMLDivElement>;
}

const Code = forwardRef<CodeProps, "pre">(
  ({ concise, full, ...props }: CodeProps, ref) => {
    const handleDragStart = useCallback(
      (event: React.DragEvent) => {
        dndDebug("dragstart");
        event.dataTransfer.dropEffect = "copy";
        setDraggedCode(full);
        event.dataTransfer.setData(pythonSnippetMediaType, full);
      },
      [full]
    );
    const handleDragEnd = useCallback((event: React.DragEvent) => {
      dndDebug("dragend");
      setDraggedCode(undefined);
    }, []);
    return (
      <HStack
        draggable={flags.dnd}
        transition="background .2s, box-shadow .2s"
        border="1px solid #95d7ce" /*brand color*/
        borderRadius="lg"
        fontFamily="code"
        overflow="hidden"
        ref={ref}
        spacing={0}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        {...props}
      >
        {flags.dnd && (
          <DragHandle borderTopLeftRadius="lg" p={1} alignSelf="stretch" />
        )}
        <CodeMirrorView
          value={concise}
          p={5}
          pl={flags.dnd ? 1 : 5}
          pt={2}
          pb={2}
        />
      </HStack>
    );
  }
);

interface DragHandleProps extends BoxProps {}

const DragHandle = (props: DragHandleProps) => {
  const [hoverDragIcon, setHoverDragIcon] = useState(false);
  return (
    <HStack
      {...props}
      bgColor={hoverDragIcon ? "#95D7CE" : "#e9f6f5"}
      onMouseEnter={() => setHoverDragIcon(true)}
      onMouseLeave={() => setHoverDragIcon(false)} /*unlisted color*/
      transition="background .2s"
    >
      <DragHandleIcon
        boxSize={3}
        color={hoverDragIcon ? "#4A7B75" : "#95d7ce"} /*brand color*/
        transition="color .2s"
      />
    </HStack>
  );
};

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
