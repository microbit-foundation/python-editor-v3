/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { usePrevious } from "@chakra-ui/hooks";
import { List, Text } from "@chakra-ui/layout";
import { useState } from "react";
import { Toolkit, ToolkitNavigationState } from "./model";
import ToolkitBreadcrumbHeading from "./ToolkitBreadcrumbHeading";
import ToolkitLevel from "./ToolkitLevel";
import ToolkitListItem from "./ToolkitListItem";
import ToolkitTopLevelHeading from "./ToolkitTopLevelHeading";
import ToolkitTopLevelListItem from "./ToolkitTopLevelListItem";
import TopicItem from "./TopicItem";

interface ToolkitProps {
  toolkit: Toolkit;
}

/**
 * A data-driven toolkit component.
 *
 * The components used here are also used with the API data to
 * generate the reference documentation.
 */
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
      onNavigate={setState}
      toolkit={toolkit}
      direction={direction}
    />
  );
};

interface ActiveTooklitLevelProps extends ToolkitProps {
  state: ToolkitNavigationState;
  onNavigate: React.Dispatch<React.SetStateAction<ToolkitNavigationState>>;
  direction: "forward" | "back" | "none";
}

const ActiveTooklitLevel = ({
  state,
  onNavigate,
  toolkit,
  direction,
}: ActiveTooklitLevelProps) => {
  if (state.topicId && state.itemId) {
    const topic = toolkit.contents.find((t) => t.name === state.topicId);
    if (topic) {
      const item = topic.contents.find((i) => i.name === state.itemId);
      if (item) {
        return (
          <ToolkitLevel
            direction={direction}
            heading={
              <ToolkitBreadcrumbHeading
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
          >
            <TopicItem
              topic={topic}
              item={item}
              detail={true}
              onForward={() =>
                onNavigate({
                  topicId: topic.name,
                  itemId: item.name,
                })
              }
              padding={5}
            />
          </ToolkitLevel>
        );
      }
    }
  } else if (state.topicId) {
    const topic = toolkit.contents.find((t) => t.name === state.topicId);
    if (topic) {
      return (
        <ToolkitLevel
          direction={direction}
          heading={
            <ToolkitBreadcrumbHeading
              parent={toolkit.name}
              title={topic.name}
              onBack={() => onNavigate({})}
            />
          }
        >
          {topic.introduction && (
            <Text p={5} fontSize="md">
              {topic.introduction}
            </Text>
          )}
          <List flex="1 1 auto">
            {topic.contents.map((item) => (
              <ToolkitListItem key={item.name}>
                <TopicItem
                  topic={topic}
                  item={item}
                  detail={false}
                  onForward={() =>
                    onNavigate({
                      topicId: topic.name,
                      itemId: item.name,
                    })
                  }
                />
              </ToolkitListItem>
            ))}
          </List>
        </ToolkitLevel>
      );
    }
  }
  return (
    <ToolkitLevel
      direction={direction}
      heading={
        <ToolkitTopLevelHeading
          name={toolkit.name}
          description={toolkit.description}
        />
      }
    >
      <List flex="1 1 auto" m={3}>
        {toolkit.contents.map((topic) => (
          <ToolkitTopLevelListItem
            key={topic.name}
            name={topic.name}
            description={topic.description}
            onForward={() =>
              onNavigate({
                topicId: topic.name,
              })
            }
          />
        ))}
      </List>
    </ToolkitLevel>
  );
};
