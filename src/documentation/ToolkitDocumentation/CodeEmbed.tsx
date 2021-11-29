/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Box, BoxProps, HStack } from "@chakra-ui/layout";
import { Portal } from "@chakra-ui/portal";
import { forwardRef } from "@chakra-ui/system";
import { Ref, RefObject, useLayoutEffect, useRef, useState } from "react";
import { useSplitViewContext } from "../../common/SplitView/context";
import { useActiveEditorActions } from "../../editor/active-editor-hooks";
import CodeMirrorView from "../../editor/codemirror/CodeMirrorView";
import { useScrollablePanelAncestor } from "../../workbench/ScrollablePanel";
import MoreButton from "../common/MoreButton";

interface CodeEmbedProps {
  code: string;
  detail?: boolean;
  hasDetail?: boolean;
  onForward?: () => void;
}

const CodeEmbed = ({
  detail,
  hasDetail,
  onForward,
  code: codeWithImports,
}: CodeEmbedProps) => {
  const actions = useActiveEditorActions();
  const [hovering, setHovering] = useState(false);
  const code = codeWithImports
    .split("\n")
    .filter((line) => line !== "from microbit import *")
    // Collapse repeated blank lines to save space. Two blank lines after imports
    // is conventional but a big waste of space here.
    .filter(
      (line, index, array) =>
        index === 0 || !(line.length === 0 && array[index - 1].length === 0)
    )
    .join("\n")
    .trim();

  const lineCount = code.trim().split("\n").length;
  const codeRef = useRef<HTMLDivElement>(null);
  const textHeight = lineCount * 1.3994140625 + "em";
  const codeHeight = `calc(${textHeight} + var(--chakra-space-5) + var(--chakra-space-5))`;

  return (
    <>
      <Box>
        <Box height={codeHeight} fontSize="md">
          <Code
            // Shadow only on this one, not the pop-up.
            boxShadow="rgba(0, 0, 0, 0.18) 0px 2px 6px;"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            value={code}
            position="absolute"
            ref={codeRef}
          />
          {hovering && (
            <CodePopUp
              setHovering={setHovering}
              value={code}
              codeRef={codeRef}
            />
          )}
        </Box>
        <HStack spacing={3}>
          <Button
            fontWeight="normal"
            color="white"
            borderColor="rgb(141, 141, 143)"
            bgColor="rgb(141, 141, 143)"
            borderTopRadius="0"
            borderBottomRadius="xl"
            variant="ghost"
            size="sm"
            onClick={() => actions?.insertCode(codeWithImports)}
          >
            Insert code
          </Button>
          {!detail && hasDetail && onForward && (
            <MoreButton onClick={onForward} />
          )}
        </HStack>
      </Box>
    </>
  );
};

interface CodePopUpProps extends BoxProps {
  setHovering: (hovering: boolean) => void;
  value: string;
  codeRef: RefObject<HTMLDivElement | null>;
}

// We draw the same code over the top in a portal so we can draw it
// above the scrollbar.
const CodePopUp = ({ setHovering, codeRef, value }: CodePopUpProps) => {
  // We need to re-render, we don't need the value.
  useScrollTop();
  useSplitViewContext();

  if (!codeRef.current) {
    return null;
  }
  return (
    <Portal>
      <Code
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        value={value}
        position="absolute"
        top={codeRef.current.getBoundingClientRect().top + "px"}
        left={codeRef.current.getBoundingClientRect().left + "px"}
      />
    </Portal>
  );
};

interface CodeProps extends BoxProps {
  value: string;
  ref?: Ref<HTMLDivElement>;
}

const Code = forwardRef<CodeProps, "pre">(
  ({ value, ...props }: CodeProps, ref) => {
    return (
      <Box
        backgroundColor="rgb(247,245,242)"
        p={5}
        borderTopRadius="lg"
        fontFamily="code"
        {...props}
        ref={ref}
      >
        <CodeMirrorView value={value} />
      </Box>
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
