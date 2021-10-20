import { IconButton } from "@chakra-ui/button";
import {
  Box,
  Divider,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/layout";
import { useState } from "react";
import { RiArrowRightSFill, RiCheckboxBlankFill } from "react-icons/ri";

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
    <VStack
      height="100%"
      justifyContent="stretch"
      backgroundColor="rgb(245, 246, 248)"
      spacing={0}
    >
      <Box
        minHeight="30"
        backgroundColor="rgb(230, 232, 239)"
        flex="0 0 auto"
        width="100%"
        p={3}
      >
        <Text as="h2" fontSize="3xl" fontWeight="semibold">
          {name}
        </Text>
        <Text>{description}</Text>
      </Box>
      <List flex="1 1 auto" p={3}>
        {contents.map((topic, index) => (
          <ListItem display="flex">
            <ListIcon
              as={RiCheckboxBlankFill}
              color="rgb(205, 210, 226)"
              fontSize="3xl"
            />
            <Box flex="1 1 auto">
              <Text as="h3">{topic.name}</Text>
              {/*Content problem! We need all descriptions to be short, or two sets.*/}
              <Text noOfLines={1}>{topic.description}</Text>
            </Box>
            <IconButton
              icon={<RiArrowRightSFill />}
              aria-label="More details"
              variant="ghost"
              color="rgb(205, 210, 226)"
              fontSize="3xl"
            />
            {index < topic.contents.length - 1 && <Divider />}
          </ListItem>
        ))}
      </List>
    </VStack>
  );
};

interface TopicContentsProps {
  toolkit: Toolkit;
  topic: ToolkitTopic;
  onNavigate: (next: ToolkitNavigationState) => void;
}

export const TopicContents = ({ topic, onNavigate }: TopicContentsProps) => {
  const { name, description, contents } = topic;
  return (
    <VStack>
      <Box>
        <Text as="h3">{name}</Text>
        <Text>{description}</Text>
      </Box>
      {contents.map((item) => (
        <TopicItem
          topic={topic}
          item={item}
          detail={false}
          onNavigate={onNavigate}
        />
      ))}
    </VStack>
  );
};

interface TopicItemProps {
  topic: ToolkitTopic;
  item: ToolkitTopicItem;
  detail?: boolean;
  onNavigate: (next: ToolkitNavigationState) => void;
}

export const TopicItem = ({ item, detail }: TopicItemProps) => {
  return (
    <Box>
      <Box>
        <Text as="h3">{item.name}</Text>
        <Text>{item.text}</Text>
        <Code value={item.code} />
        {detail && <Text>{item.furtherText}</Text>}
      </Box>
    </Box>
  );
};

const Code = ({ value }: { value: string }) => {
  return (
    <pre>
      <code>{value}</code>
    </pre>
  );
};

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
