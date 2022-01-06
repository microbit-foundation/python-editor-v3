/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, List } from "@chakra-ui/layout";
import { useCallback } from "react";
import { Anchor, RouterParam, useRouterParam } from "../../router-hooks";
import { isV2Only, Toolkit, ToolkitNavigationState } from "./model";
import { useAnimationDirection } from "./toolkit-hooks";
import ToolkitBreadcrumbHeading from "./ToolkitBreadcrumbHeading";
import ToolkitContent from "./ToolkitContent";
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
  const [anchor, setAnchor] = useRouterParam(RouterParam.explore);
  const direction = useAnimationDirection(anchor);
  const state = parseAnchor(anchor);
  const handleNavigate = useCallback(
    (state: ToolkitNavigationState) => {
      const parts = [state.topicId, state.itemId].filter(Boolean);
      setAnchor(parts.length ? { id: parts.join("/") } : undefined);
    },
    [setAnchor]
  );
  return (
    <ActiveToolkitLevel
      key={anchor ? 0 : 1}
      state={state}
      onNavigate={handleNavigate}
      toolkit={toolkit}
      direction={direction}
    />
  );
};

const parseAnchor = (anchor: Anchor | undefined): ToolkitNavigationState => {
  if (!anchor) {
    return {};
  }
  const [topicId, itemId] = anchor.id.split("/");
  return {
    topicId,
    itemId,
  };
};

interface ActiveToolkitLevelProps extends ToolkitProps {
  state: ToolkitNavigationState;
  onNavigate: (state: ToolkitNavigationState) => void;
  direction: "forward" | "back" | "none";
}

const ActiveToolkitLevel = ({
  state,
  onNavigate,
  toolkit,
  direction,
}: ActiveToolkitLevelProps) => {
  const topic = state.topicId
    ? toolkit.contents?.find((t) => t.name === state.topicId)
    : undefined;
  const activeItem =
    topic && state.itemId
      ? topic.contents?.find((i) => i.name === state.itemId)
      : undefined;

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
          <Box p={5} pb={1} fontSize="md">
            <ToolkitContent content={topic.introduction} />
          </Box>
        )}
        <List flex="1 1 auto">
          {topic.contents?.map((item) => (
            <ToolkitListItem key={item.name} showIcon={false}>
              <TopicItem
                topic={topic}
                item={item}
                active={activeItem === item}
              />
            </ToolkitListItem>
          ))}
        </List>
      </ToolkitLevel>
    );
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
        {toolkit.contents?.map((topic) => (
          <ToolkitTopLevelListItem
            key={topic.name}
            name={topic.name + (isV2Only(topic) ? " (V2)" : "")}
            description={topic.subtitle}
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
