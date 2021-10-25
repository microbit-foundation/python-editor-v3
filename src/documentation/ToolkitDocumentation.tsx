import { Button, IconButton } from "@chakra-ui/button";
import { usePrevious } from "@chakra-ui/hooks";
import {
  Box,
  BoxProps,
  Divider,
  HStack,
  List,
  ListIcon,
  ListItem,
  ListItemProps,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/layout";
import { Portal } from "@chakra-ui/portal";
import { forwardRef } from "@chakra-ui/system";
import { motion, Spring } from "framer-motion";
import {
  ReactNode,
  Ref,
  RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  RiArrowLeftSFill,
  RiArrowRightLine,
  RiArrowRightSFill,
  RiCheckboxBlankFill,
} from "react-icons/ri";
import { useSplitViewContext } from "../common/SplitView/context";

export interface Toolkit {
  name: string;
  description: string;
  contents: ToolkitTopic[];
}

export interface ToolkitTopic {
  name: string;
  description: string;
  contents: ToolkitTopicItem[];
}

export interface ToolkitTopicItem {
  name: string;
  text: string;
  code: string;
  furtherText?: string;
}

interface TopicListProps {
  toolkit: Toolkit;
  onNavigate: (next: ToolkitNavigationState) => void;
}

const ToolkitTopicList = ({
  toolkit: { name, description, contents },
  onNavigate,
}: TopicListProps) => {
  return (
    <ToolkitLevel
      heading={
        <>
          <Text as="h2" fontSize="3xl" fontWeight="semibold">
            {name}
          </Text>
          <Text fontSize="sm">{description}</Text>
        </>
      }
    >
      <List flex="1 1 auto" m={3}>
        {contents.map((topic) => (
          <ToolkitListItem
            key={topic.name}
            onClick={() => onNavigate({ topicId: topic.name })}
            cursor="pointer"
          >
            <Box flex="1 1 auto">
              <Text as="h3" fontSize="lg" fontWeight="semibold">
                {topic.name}
              </Text>
              {/*Content problem! We need all descriptions to be short, or two sets.*/}
              <Text fontSize="sm" noOfLines={1}>
                {topic.description}
              </Text>
            </Box>
            <IconButton
              icon={<RiArrowRightSFill />}
              aria-label="More details"
              variant="ghost"
              color="rgb(179, 186, 211)"
              fontSize="3xl"
              onClick={() => onNavigate({ topicId: topic.name })}
            />
          </ToolkitListItem>
        ))}
      </List>
    </ToolkitLevel>
  );
};

interface TopicContentsProps extends BoxProps {
  toolkit: Toolkit;
  topic: ToolkitTopic;
  onNavigate: (next: ToolkitNavigationState) => void;
}

const TopicContents = ({
  toolkit,
  topic,
  onNavigate,
  ...props
}: TopicContentsProps) => {
  const { contents } = topic;
  return (
    <ToolkitLevel
      heading={
        <BreadcrumbHeading
          parent={toolkit.name}
          title={topic.name}
          onBack={() => onNavigate({})}
        />
      }
      {...props}
    >
      <List flex="1 1 auto">
        {contents.map((item) => (
          <ToolkitListItem key={item.name}>
            <TopicItem
              topic={topic}
              item={item}
              detail={false}
              onNavigate={onNavigate}
            />
          </ToolkitListItem>
        ))}
      </List>
    </ToolkitLevel>
  );
};

interface TopicItemDetailProps extends BoxProps {
  toolkit: Toolkit;
  topic: ToolkitTopic;
  item: ToolkitTopicItem;
  onNavigate: (next: ToolkitNavigationState) => void;
}

const TopicItemDetail = ({
  toolkit,
  topic,
  item,
  onNavigate,
  ...props
}: TopicItemDetailProps) => {
  return (
    <ToolkitLevel
      heading={
        <BreadcrumbHeading
          parent={topic.name}
          grandparent={toolkit.name}
          title={item.name}
          onBack={() =>
            onNavigate({
              topicId: topic.name,
            })
          }
        />
      }
      {...props}
    >
      <TopicItem
        topic={topic}
        item={item}
        detail={true}
        onNavigate={onNavigate}
        padding={5}
      />
    </ToolkitLevel>
  );
};

interface TopicItemProps extends BoxProps {
  topic: ToolkitTopic;
  item: ToolkitTopicItem;
  detail?: boolean;
  onNavigate: (next: ToolkitNavigationState) => void;
}

const TopicItem = ({
  topic,
  item,
  detail,
  onNavigate,
  ...props
}: TopicItemProps) => {
  const [hovering, setHovering] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const lines = item.code.trim().split("\n").length;
  const textHeight = lines * 1.5 + "em";
  const codeHeight = `calc(${textHeight} + var(--chakra-space-5) + var(--chakra-space-5))`;
  return (
    <Stack spacing={3} {...props}>
      <Text as="h3" fontSize="lg" fontWeight="semibold">
        {item.name}
      </Text>
      <Text fontSize="sm">{item.text}</Text>
      <Box>
        <Box height={codeHeight}>
          <Code
            onMouseEnter={() => setHovering(false)}
            onMouseLeave={() => setHovering(false)}
            value={item.code}
            position="absolute"
            ref={codeRef}
          />
          {hovering && (
            <CodePopUp
              setHovering={setHovering}
              value={item.code}
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
          >
            Insert code
          </Button>
          {!detail && item.furtherText && (
            <Button
              onClick={() =>
                onNavigate({
                  topicId: topic.name,
                  itemId: item.name,
                })
              }
              fontWeight="normal"
              color="brand.500"
              variant="unstyled"
              size="sm"
              rightIcon={<RiArrowRightLine />}
            >
              More
            </Button>
          )}
        </HStack>
      </Box>
      {detail && <Text fontSize="sm">{item.furtherText}</Text>}
    </Stack>
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
  useScrollTop("left-panel-viewport");
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
      <Text
        ref={ref}
        as="pre"
        backgroundColor="rgb(247,245,242)"
        padding={5}
        borderTopRadius="lg"
        boxShadow="rgba(0, 0, 0, 0.18) 0px 2px 6px;"
        fontFamily="Source Code Pro, monospace"
        {...props}
      >
        {value}
      </Text>
    );
  }
);

interface ToolkitNavigationState {
  topicId?: string;
  itemId?: string;
}

interface ToolkitProps {
  toolkit: Toolkit;
}

export const ToolkitDocumentation = ({ toolkit }: ToolkitProps) => {
  const [state, setState] = useState<ToolkitNavigationState>({});
  const previous = usePrevious(state);
  const currentLevel = [state.itemId, state.topicId].filter(Boolean).length;
  const previousLevel = previous
    ? [previous.itemId, previous.topicId].filter(Boolean).length
    : 0;
  const direction =
    currentLevel === previousLevel
      ? "none"
      : currentLevel > previousLevel
      ? "forward"
      : "back";
  return (
    <ActiveTooklitLevel
      key={state.topicId + "-" + state.itemId}
      state={state}
      setState={setState}
      toolkit={toolkit}
      direction={direction}
    />
  );
};

interface ActiveTooklitLevelProps extends ToolkitProps {
  state: ToolkitNavigationState;
  setState: React.Dispatch<React.SetStateAction<ToolkitNavigationState>>;
  direction: "forward" | "back" | "none";
}

const ActiveTooklitLevel = ({
  state,
  setState,
  toolkit,
  direction,
}: ActiveTooklitLevelProps) => {
  if (state.topicId && state.itemId) {
    const topic = toolkit.contents.find((t) => t.name === state.topicId);
    if (topic) {
      const item = topic.contents.find((i) => i.name === state.itemId);
      if (item) {
        return (
          <Slide direction={direction}>
            <TopicItemDetail
              toolkit={toolkit}
              topic={topic}
              item={item}
              onNavigate={setState}
            />
          </Slide>
        );
      }
    }
  } else if (state.topicId) {
    const topic = toolkit.contents.find((t) => t.name === state.topicId);
    if (topic) {
      return (
        <Slide direction={direction}>
          <TopicContents
            toolkit={toolkit}
            topic={topic}
            onNavigate={setState}
          />
        </Slide>
      );
    }
  }
  return (
    <Slide direction={direction}>
      <ToolkitTopicList toolkit={toolkit} onNavigate={setState} />
    </Slide>
  );
};

const animations = {
  forward: {
    initial: {
      x: "-100%",
    },
    animate: {
      x: 0,
    },
  },
  back: {
    initial: {
      x: "100%",
    },
    animate: {
      x: 0,
    },
  },
  none: {
    initial: false,
    animate: {},
  },
};
const spring: Spring = {
  type: "spring",
  bounce: 0.2,
  duration: 0.5,
};

const Slide = ({
  direction,
  children,
}: {
  direction: "forward" | "back" | "none";
  children: ReactNode;
}) => {
  const animation = animations[direction];
  return (
    <motion.div
      transition={spring}
      initial={animation.initial}
      animate={animation.animate}
    >
      {children}
    </motion.div>
  );
};

interface ToolkitLevelProps extends BoxProps {
  heading: ReactNode;
  children: ReactNode;
}

const ToolkitLevel = ({ heading, children, ...props }: ToolkitLevelProps) => (
  <VStack
    justifyContent="stretch"
    // Disabled for now. If this it to be the background of all tabs it should
    // be higher up the tree.
    spacing={0}
    {...props}
  >
    <Box
      minHeight="28"
      backgroundColor="rgb(230, 232, 239)"
      flex="0 0 auto"
      width="100%"
      p={3}
      pl={5}
      pr={5}
    >
      {heading}
    </Box>
    {children}
  </VStack>
);

const ToolkitListItem = ({ children, ...props }: ListItemProps) => (
  <ListItem {...props}>
    <HStack ml={3} mr={3} mt={5} mb={5} spacing={0.5}>
      <ListIcon
        as={RiCheckboxBlankFill}
        color="rgb(205, 210, 226)"
        fontSize="3xl"
        alignSelf="flex-start"
      />
      {children}
    </HStack>
    <Divider />
  </ListItem>
);

interface BreadcrumbHeadingProps {
  title: string;
  parent: string;
  grandparent?: string;
  onBack: () => void;
}

const BreadcrumbHeading = ({
  title,
  parent,
  grandparent,
  onBack,
}: BreadcrumbHeadingProps) => {
  return (
    <>
      <HStack>
        <Button
          leftIcon={<RiArrowLeftSFill color="rgb(179, 186, 211)" />}
          sx={{
            span: {
              margin: 0,
            },
            svg: {
              width: "1.5rem",
              height: "1.5rem",
            },
          }}
          display="flex"
          variant="unstyled"
          onClick={onBack}
          alignItems="center"
          fontWeight="sm"
        >
          {grandparent && grandparent + " / "}
          {parent}
        </Button>
      </HStack>
      <Text as="h2" fontSize="3xl" fontWeight="semibold">
        {title}
      </Text>
    </>
  );
};

const useScrollTop = (id: string) => {
  const [scrollTop, setScrollTop] = useState(0);
  useLayoutEffect(() => {
    const parent = document.getElementById(id);
    if (!parent) {
      throw new Error();
    }
    setScrollTop(parent.scrollTop);
    const listener = () => setScrollTop(parent.scrollTop);
    parent.addEventListener("scroll", listener);
    return () => {
      parent.removeEventListener("scroll", listener);
    };
  }, [id]);
  return scrollTop;
};

export default ToolkitDocumentation;
