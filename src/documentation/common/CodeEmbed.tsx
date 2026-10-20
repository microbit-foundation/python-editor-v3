/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip, VisuallyHidden } from "@microbit/ui";
import React, {
  CSSProperties,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Focusable } from "react-aria-components";
import { FormattedMessage, useIntl } from "react-intl";
import { Box, HStack } from "styled-system/jsx";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import { useScrollablePanelAncestor } from "../../common/ScrollablePanel";
import { useActiveEditorActions } from "../../editor/active-editor-hooks";
import CodeMirrorView from "../../editor/codemirror/CodeMirrorView";
import { debug as dndDebug, setDragContext } from "../../editor/codemirror/dnd";
import { useLogging } from "../../logging/logging-hooks";
import { useProjectActions } from "../../project/project-hooks";
import { useSessionSettings } from "../../settings/session-settings";
import { useClipboard } from "@microbit/ui";
import DragHandle from "../common/DragHandle";
import { useCodeDragImage } from "../documentation-hooks";
import CodeActionButton from "./CodeActionButton";
import { useHotkeys } from "react-hotkeys-hook";
import { keyboardShortcuts } from "../../common/keyboard-shortcuts";

interface CodeEmbedProps {
  code: string;
  parentSlug?: string;
  toolkitType?: string;
  title?: string;
}

type CodeEmbedState =
  /**
   * Default state.
   */
  | "default"
  /**
   * Highlighted state when hovering "Copy code".
   */
  | "highlighted"
  /**
   * Raised state on mouse over.
   */
  | "raised";

const CodeEmbed = ({
  code: codeWithImports,
  toolkitType,
  parentSlug,
  title,
}: CodeEmbedProps) => {
  const [copyCodeOpen, setCopyCodeOpen] = useState(false);
  const [state, originalSetState] = useState<CodeEmbedState>("default");
  // We want to debounce raising so that we don't raise very briefly during scroll.
  // We don't ever want to delay other actions.
  const setState = useMemo(() => {
    let timeout: any;
    return (newState: CodeEmbedState, immediate: boolean = true) => {
      clearTimeout(timeout);
      if (immediate) {
        originalSetState(newState);
      } else {
        timeout = setTimeout(() => {
          originalSetState(newState);
        }, 30);
      }
    };
  }, [originalSetState]);
  const toRaised = useCallback(() => setState("raised", false), [setState]);
  const toDefault = useCallback(() => setState("default"), [setState]);
  const toHighlighted = useCallback(() => setState("highlighted"), [setState]);
  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!codeRef.current) {
        return;
      }
      const overElements = document.elementsFromPoint(e.clientX, e.clientY);
      if (!overElements.includes(codeRef.current)) {
        toDefault();
      } else {
        // The mouse hasn't really left, it's just now over the pop-up.
      }
    },
    [toDefault]
  );
  useScrollableAncestorScroll(toDefault);

  const actions = useActiveEditorActions();
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
  const { onCopy } = useClipboard(code);
  const handleCopyCode = useCallback(async () => {
    onCopy();
    await actions?.copyCode(
      code,
      codeWithImports,
      "example",
      parentSlug,
      toolkitType
    );
  }, [actions, code, codeWithImports, onCopy, parentSlug, toolkitType]);
  const projectActions = useProjectActions();
  const handleOpenIdea = useCallback(async () => {
    projectActions.openIdea(parentSlug, codeWithImports, title!);
  }, [codeWithImports, parentSlug, projectActions, title]);
  const lineCount = code.trim().split("\n").length;
  const codeRef = useRef<HTMLDivElement>(null);
  const textHeight = lineCount * 1.375 + "em";
  const codeHeight = `calc(${textHeight} + var(--spacing-2) + var(--spacing-2))`;
  const codePopUpHeight = `calc(${codeHeight} + 2px)`; // Account for border.
  const hotKeysRef = useHotkeys(keyboardShortcuts.copyCode, handleCopyCode, {
    preventDefault: true,
  }) as Ref<HTMLDivElement>;
  const raisedLook =
    toolkitType === "ideas" ? state === "highlighted" : state !== "default";
  return (
    <Box position="relative">
      <Box
        fontSize="md"
        ref={hotKeysRef}
        tabIndex={-1}
        // Runtime value from the line count.
        style={{ height: codeHeight }}
      >
        <Code
          onMouseEnter={toRaised}
          onMouseLeave={handleMouseLeave}
          onCodeDragEnd={toDefault}
          isOpen={copyCodeOpen}
          onToggle={setCopyCodeOpen}
          concise={code}
          full={codeWithImports}
          ref={codeRef}
          raisedLook={raisedLook}
          highlightDragHandle={state === "raised"}
          parentSlug={parentSlug}
          toolkitType={toolkitType}
          isPopUp={false}
        />
        {state === "raised" && (
          <CodePopUp
            onMouseLeave={toDefault}
            onCodeDragEnd={toDefault}
            isOpen={copyCodeOpen}
            onToggle={setCopyCodeOpen}
            style={{
              height: codePopUpHeight,
              top: codeRef.current!.getBoundingClientRect().top + "px",
              left: codeRef.current!.getBoundingClientRect().left + "px",
              width: codeRef.current!.offsetWidth + "px",
            }}
            concise={code}
            full={codeWithImports}
            toolkitType={toolkitType}
            parentSlug={parentSlug}
          />
        )}
      </Box>
      <CodeActionButton
        isOpen={toolkitType === "ideas" ? true : copyCodeOpen}
        toHighlighted={toHighlighted}
        toDefault={toDefault}
        codeAction={toolkitType === "ideas" ? handleOpenIdea : handleCopyCode}
        borderAdjustment={true}
        toolkitType={toolkitType}
      />
    </Box>
  );
};

interface CodePopUpProps {
  concise: string;
  full: string;
  toolkitType?: string;
  parentSlug?: string;
  onCodeDragEnd: () => void;
  onMouseLeave: React.MouseEventHandler<HTMLElement>;
  isOpen: boolean;
  onToggle: React.Dispatch<React.SetStateAction<boolean>>;
  style?: CSSProperties;
}

// We draw the same code over the top in a portal so we can draw it
// above the scrollbar. You can achieve almost the same effect with
// z-index, but Safari draws the scrollbars over the code that should
// be above them.
const CodePopUp = ({
  concise,
  full,
  toolkitType,
  parentSlug,
  ...props
}: CodePopUpProps) => {
  return createPortal(
    <Code
      concise={concise}
      full={full}
      // We're always "raised" as this is the pop-up.
      raisedLook={toolkitType !== "ideas"}
      highlightDragHandle
      toolkitType={toolkitType}
      parentSlug={parentSlug}
      isPopUp
      {...props}
    />,
    document.body
  );
};

interface CodeProps {
  concise: string;
  full: string;
  highlightDragHandle: boolean;
  toolkitType?: string;
  parentSlug?: string;
  onCodeDragEnd: () => void;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  isOpen: boolean;
  onToggle: React.Dispatch<React.SetStateAction<boolean>>;
  raisedLook: boolean;
  /** The portalled copy: absolute at runtime coordinates, above scrollbars. */
  isPopUp: boolean;
  style?: CSSProperties;
}

const Code = React.forwardRef<HTMLDivElement, CodeProps>(
  (
    {
      concise,
      full,
      highlightDragHandle,
      toolkitType,
      parentSlug,
      onCodeDragEnd,
      isOpen,
      onToggle,
      raisedLook,
      isPopUp,
      style,
      ...props
    }: CodeProps,
    ref
  ) => {
    const logging = useLogging();
    const dragImage = useCodeDragImage();
    const handleDragStart = useCallback(
      (event: React.DragEvent) => {
        logging.event({
          type: "code_drag",
          detail: { surface: toolkitType, id: parentSlug },
        });
        dndDebug("dragstart");
        event.dataTransfer.dropEffect = "copy";
        setDragContext({
          code: full,
          type: "example",
          tab: toolkitType,
          id: parentSlug,
        });
        event.dataTransfer.setData(pythonSnippetMediaType, full);
        if (dragImage.current) {
          event.dataTransfer.setDragImage(dragImage.current, 0, 0);
        }
      },
      [full, dragImage, parentSlug, toolkitType, logging]
    );
    const handleDragEnd = useCallback(
      (_event: React.DragEvent) => {
        onCodeDragEnd();
        dndDebug("dragend");
        setDragContext(undefined);
      },
      [onCodeDragEnd]
    );
    const intl = useIntl();
    const [{ dragDropSuccess }] = useSessionSettings();
    const tooltipDisabled =
      toolkitType === "ideas" ? true : Boolean(dragDropSuccess);
    const content = (
      <HStack
        // Interactive: click toggles the action button, drag inserts code
        // (also required by react-aria's Focusable tooltip trigger).
        role="button"
        draggable={toolkitType === "ideas" ? false : true}
        transition="background .2s, box-shadow .2s"
        borderWidth="1px"
        borderColor="blimpTeal.300"
        borderRadius="lg"
        fontFamily="code"
        overflow="hidden"
        ref={ref}
        gap="0"
        onClick={() => onToggle(!isOpen)}
        onDragStart={toolkitType === "ideas" ? () => {} : handleDragStart}
        onDragEnd={handleDragEnd}
        cursor={toolkitType === "ideas" ? "default" : "grab"}
        position="absolute"
        fontSize={isPopUp ? "md" : undefined}
        zIndex={isPopUp ? "codePopUp" : "code"}
        bgColor={raisedLook ? "blimpTeal.50" : "white"}
        boxShadow={isPopUp ? "rgba(0, 0, 0, 0.18) 0px 2px 6px" : undefined}
        tabIndex={isPopUp ? undefined : 0}
        _focusVisible={{ focusRing: "outline" }}
        // Pop-up position/size at runtime coordinates.
        style={style}
        {...props}
      >
        <VisuallyHidden>
          <FormattedMessage id="code-example" />
        </VisuallyHidden>
        {toolkitType !== "ideas" && (
          <DragHandle
            css={{ borderTopLeftRadius: "lg", p: "1", alignSelf: "stretch" }}
            highlight={highlightDragHandle}
          />
        )}

        <CodeMirrorView
          css={{
            // If we fix copy and deal with selection sync then we should
            // probably remove this, though it'll make it harder to drag.
            pointerEvents: "none",
            flex: "1 0 auto",
            p: "5",
            pl: "1",
            pt: "2",
            pb: "2",
            minW: "40",
          }}
          value={concise}
        />
      </HStack>
    );
    return tooltipDisabled ? (
      content
    ) : (
      <Tooltip
        hasArrow
        placement="top start"
        label={intl.formatMessage({ id: "drag-hover" })}
      >
        <Focusable>{content}</Focusable>
      </Tooltip>
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
