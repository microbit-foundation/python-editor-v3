/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { usePrevious } from "@chakra-ui/hooks";
import { List } from "@chakra-ui/layout";
import { useState } from "react";
import { Toolkit, ToolkitNavigationState } from "./model";
import Slide from "./Slide";
import ToolkitBreadcrumbHeading from "./ToolkitBreadcrumbHeading";
import ToolkitLevel from "./ToolkitLevel";
import ToolkitListItem from "./ToolkitListItem";
import ToolkitTopLevelHeading from "./ToolkitTopLevelHeading";
import ToolkitTopLevelListItem from "./ToolkitTopLevelListItem";
import TopicItem from "./TopicItem";

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
          <Slide direction={direction}>
            <ToolkitLevel
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
          </Slide>
        );
      }
    }
  } else if (state.topicId) {
    const topic = toolkit.contents.find((t) => t.name === state.topicId);
    if (topic) {
      return (
        <Slide direction={direction}>
          <ToolkitLevel
            heading={
              <ToolkitBreadcrumbHeading
                parent={toolkit.name}
                title={topic.name}
                onBack={() => onNavigate({})}
              />
            }
          >
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
        </Slide>
      );
    }
  }
  return (
    <Slide direction={direction}>
      <ToolkitLevel
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
    </Slide>
  );
};
