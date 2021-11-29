/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Link,
  Stack,
  Text,
} from "@chakra-ui/layout";
import { Portal } from "@chakra-ui/portal";
import { Select } from "@chakra-ui/select";
import { forwardRef } from "@chakra-ui/system";
import BlockContent from "@sanity/block-content-to-react";
import unconfiguredImageUrlBuilder from "@sanity/image-url";
import {
  ChangeEvent,
  ReactNode,
  Ref,
  RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSplitViewContext } from "../../common/SplitView/context";
import { useActiveEditorActions } from "../../editor/active-editor-hooks";
import CodeMirrorView from "../../editor/codemirror/CodeMirrorView";
import { useRouterState } from "../../router-hooks";
import { useScrollablePanelAncestor } from "../../workbench/ScrollablePanel";
import {
  ToolkitApiLink,
  ToolkitCode,
  ToolkitImage,
  ToolkitInternalLink,
  ToolkitPortableText,
  ToolkitTopic,
  ToolkitTopicEntry,
} from "./model";
import MoreButton from "../common/MoreButton";

interface TopicItemProps extends BoxProps {
  topic: ToolkitTopic;
  item: ToolkitTopicEntry;
  detail?: boolean;
  onForward: () => void;
}

/**
 * A toolkit topic item. Can be displayed without detail (for the listing)
 * or with detail for the "More info" view.
 *
 * We show a pop-up over the code on hover to reveal the full code, overlapping
 * the sidebar scroll area.
 */
const TopicItem = ({
  topic,
  item,
  detail,
  onForward,
  ...props
}: TopicItemProps) => {
  const { content, detailContent, alternatives, alternativesLabel } = item;
  const hasDetail = !!detailContent;
  const [alternativeIndex, setAlternativeIndex] = useState<number | undefined>(
    alternatives && alternatives.length > 0 ? 0 : undefined
  );
  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setAlternativeIndex(parseInt(e.currentTarget.value, 10));
    },
    [setAlternativeIndex]
  );
  return (
    <Stack
      spacing={detail ? 5 : 3}
      {...props}
      fontSize={detail ? "md" : "sm"}
      listStyle="disc inside"
    >
      {!detail && (
        <Text as="h3" fontSize="lg" fontWeight="semibold">
          {item.name}
        </Text>
      )}
      <ToolkitContent
        content={content}
        detail={detail}
        hasDetail={hasDetail}
        onForward={onForward}
      />
      {alternatives && typeof alternativeIndex === "number" && (
        <>
          <Flex wrap="wrap" as="label">
            <Text alignSelf="center" mr={2} as="span">
              {alternativesLabel}
            </Text>
            <Select
              w="fit-content"
              onChange={handleSelectChange}
              value={alternativeIndex}
              size="sm"
            >
              {alternatives.map((alterative, index) => (
                <option key={alterative.name} value={index}>
                  {alterative.name}
                </option>
              ))}
            </Select>
          </Flex>

          <ToolkitContent
            content={alternatives[alternativeIndex].content}
            detail={detail}
            hasDetail={hasDetail}
            onForward={onForward}
          />
        </>
      )}
      {detail && detailContent && (
        <ToolkitContent
          content={detailContent}
          detail={detail}
          hasDetail={hasDetail}
          onForward={onForward}
        />
      )}
    </Stack>
  );
};

interface ToolkitContentProps {
  content: ToolkitPortableText;
  detail?: boolean;
  hasDetail?: boolean;
  onForward: () => void;
}

export const defaultQuality = 80;

export const imageUrlBuilder = unconfiguredImageUrlBuilder()
  // Hardcoded for now as there's no practical alternative.
  .projectId("ajwvhvgo")
  .dataset("apps")
  .auto("format")
  .dpr(window.devicePixelRatio ?? 1)
  .quality(defaultQuality);

const ToolkitApiLinkMark = (props: SerializerMarkProps<ToolkitApiLink>) => {
  const [state, setState] = useRouterState();
  return (
    <Link
      color="brand.600"
      onClick={(e) => {
        e.preventDefault();
        setState({
          ...state,
          tab: "reference",
          reference: props.mark.name,
        });
      }}
    >
      {props.children}
    </Link>
  );
};

const ToolkitInternalLinkMark = (
  props: SerializerMarkProps<ToolkitInternalLink>
) => {
  const [state, setState] = useRouterState();
  return (
    <Link
      color="brand.600"
      onClick={(e) => {
        e.preventDefault();
        setState({
          ...state,
          // Hmm, we need to know the tab/toolkit (we should name them the same).
          // We also need to switch to router-based navigation for the other toolkits.
        });
      }}
    >
      {props.children}
    </Link>
  );
};

interface SerializerNodeProps<T> {
  node: T;
}

interface HasChildren {
  children: ReactNode;
}

interface SerializerMarkProps<T> extends HasChildren {
  mark: T;
}

const ToolkitContent = ({ content, ...outerProps }: ToolkitContentProps) => {
  const serializers = {
    // This is a serializer for the wrapper element.
    // We use a fragment so we can use spacing from the context into which we render.
    container: (props: HasChildren) => <>{props.children}</>,
    types: {
      python: ({ node: { main } }: SerializerNodeProps<ToolkitCode>) => (
        <CodeEmbed code={main} {...outerProps} />
      ),
      simpleImage: (props: SerializerNodeProps<ToolkitImage>) => {
        return (
          <Image
            src={imageUrlBuilder
              .image(props.node.asset)
              .width(300)
              .fit("max")
              .url()}
            alt={props.node.alt}
            w="300px"
          />
        );
      },
    },
    marks: {
      toolkitInternalLink: ToolkitInternalLinkMark,
      toolkitApiLink: ToolkitApiLinkMark,
    },
  };
  return <BlockContent blocks={content} serializers={serializers} />;
};

interface CodeEmbedProps {
  code: string;
  detail?: boolean;
  hasDetail?: boolean;
  onForward: () => void;
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
  const textHeight = lineCount * 1.375 + "em";
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
          {!detail && hasDetail && <MoreButton onClick={onForward} />}
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

export default TopicItem;
