import { Button, IconButton } from "@chakra-ui/button";
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
  RiArrowRightSFill,
  RiCheckboxBlankFill,
} from "react-icons/ri";

export const pythonToolkit: Toolkit = {
  name: "Python toolkit",
  description: "Some useful description here",
  contents: [
    {
      name: "Functions",
      description:
        "Functions let you re-use the same set of instructions many times in a program. They can perform a complex task, or add new functionality to your code and make it easier to read and modify. You define your function near the start of your program, giving it a name, then call it using its name.",
      contents: [
        {
          name: "Procedures",
          text: "Procedures, also called sub-routines, are functions that perform a fixed set of instructions.\nThis function called heartbeat animates a heart on the LED display when you press button A:",
          code: `def heartbeat():
    display.show(Image.HEART_SMALL)
    sleep(500)
    display.show(Image.HEART)
    sleep(500)
    display.clear()

while True:
    if button_a.was_pressed():
        heartbeat()`,
        },
        {
          name: "Functions with parameters",
          text: "You can pass parameters to functions. In this example, the animation runs once if you press button A, three times if you press button B:",
          code: `def heartbeat(h):
    for x in range(h):
        display.show(Image.HEART_SMALL)
        sleep(500)
        display.show(Image.HEART)
        sleep(500)
        display.clear()

while True:
    if button_a.was_pressed():
        heartbeat(1)
    if button_b.was_pressed():
        heartbeat(3)`,
          furtherText:
            "Note that because we used a function, we only need one set of code to display the animation.",
        },
      ],
    },
    {
      name: "Loops",
      description: "See Loops",
      contents: [],
    },
  ],
};

interface Toolkit {
  name: string;
  description: string;
  contents: ToolkitTopic[];
}

interface ToolkitTopic {
  name: string;
  description: string;
  contents: ToolkitTopicItem[];
}

interface ToolkitTopicItem {
  name: string;
  text: string;
  code: string;
  furtherText?: string;
}

interface TopicListProps {
  toolkit: Toolkit;
  onNavigate: (next: ToolkitNavigationState) => void;
}

export const ToolkitTopicList = ({
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

interface TopicContentsProps {
  toolkit: Toolkit;
  topic: ToolkitTopic;
  onNavigate: (next: ToolkitNavigationState) => void;
}

export const TopicContents = ({
  toolkit,
  topic,
  onNavigate,
}: TopicContentsProps) => {
  const { name, contents } = topic;
  return (
    <ToolkitLevel
      heading={
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
              onClick={() => onNavigate({})}
              alignItems="center"
              fontWeight="sm"
            >
              {toolkit.name}
            </Button>
          </HStack>
          <Text as="h2" fontSize="3xl" fontWeight="semibold">
            {name}
          </Text>
        </>
      }
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

interface TopicItemProps {
  topic: ToolkitTopic;
  item: ToolkitTopicItem;
  detail?: boolean;
  onNavigate: (next: ToolkitNavigationState) => void;
}

export const TopicItem = ({ item, detail }: TopicItemProps) => {
  const [hovering, setHovering] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  return (
    <Stack spacing={3} onScroll={() => setHovering(false)}>
      <Text as="h3" fontSize="lg" fontWeight="semibold">
        {item.name}
      </Text>
      <Text>{item.text}</Text>
      <Box height={item.code.trim().split(/[\r\n]+/).length * 2 + "em"}>
        <Code
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={() => setHovering(!hovering)}
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
      {detail && <Text>{item.furtherText}</Text>}
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
  if (!codeRef.current) {
    return null;
  }
  return (
    <Portal>
      <Code
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => setHovering(false)}
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
        ref={ref}
        as="pre"
        backgroundColor="rgb(247,245,242)"
        padding={5}
        borderRadius="lg"
        boxShadow="rgba(0, 0, 0, 0.18) 0px 2px 6px;"
        {...props}
      >
        {value}
      </Box>
    );
  }
);

interface ToolkitNavigationState {
  topicId?: string;
  itemId?: string;
}

interface ToolkitNavigationProps {
  toolkit: Toolkit;
}

export const ToolkitNavigation = ({ toolkit }: ToolkitNavigationProps) => {
  // Try this with useReducer?
  const [state, setState] = useState<ToolkitNavigationState>({});
  if (state.topicId && state.itemId) {
    const topic = toolkit.contents.find((t) => t.name === state.topicId);
    if (topic) {
      const item = topic.contents.find((i) => i.name === state.itemId);
      if (item) {
        return (
          <TopicItem topic={topic} item={item} detail onNavigate={setState} />
        );
      }
    }
  }
  if (state.topicId) {
    const topic = toolkit.contents.find((t) => t.name === state.topicId);
    if (topic) {
      return (
        <TopicContents toolkit={toolkit} topic={topic} onNavigate={setState} />
      );
    }
  }
  return <ToolkitTopicList toolkit={toolkit} onNavigate={setState} />;
};

interface ToolkitLevelProps {
  heading: ReactNode;
  children: ReactNode;
}

const ToolkitLevel = ({ heading, children }: ToolkitLevelProps) => (
  <VStack
    justifyContent="stretch"
    backgroundColor="rgb(245, 246, 248)"
    spacing={0}
  >
    <Box
      minHeight="28"
      backgroundColor="rgb(230, 232, 239)"
      flex="0 0 auto"
      width="100%"
      p={3}
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
