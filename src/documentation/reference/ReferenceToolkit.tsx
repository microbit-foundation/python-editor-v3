/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Divider, List, ListItem } from "@chakra-ui/layout";
import { useCallback } from "react";
import { Anchor, RouterParam, useRouterParam } from "../../router-hooks";
import { getTopicAndEntry } from "./api";
import { isV2Only, Toolkit } from "./model";
import { useAnimationDirection } from "./toolkit-hooks";
import ToolkitBreadcrumbHeading from "./ToolkitBreadcrumbHeading";
import ToolkitContent from "./ToolkitContent";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import ToolkitTopicEntry from "./ToolkitTopicEntry";
import AreaHeading from "../../common/AreaHeading";
import ToolkitTopLevelListItem from "./ToolkitTopLevelListItem";

interface ReferenceToolkitProps {
  toolkit: Toolkit;
}

/**
 * A data-driven toolkit component.
 *
 * The components used here are also used with the API data to
 * generate the API documentation.
 */
const ReferenceToolkit = ({ toolkit }: ReferenceToolkitProps) => {
  const [anchor, setAnchor] = useRouterParam(RouterParam.reference);
  const direction = useAnimationDirection(anchor);
  const topicOrEntryId = anchor?.id;
  const handleNavigate = useCallback(
    (topicOrEntryId: string | undefined) => {
      setAnchor(
        topicOrEntryId ? { id: topicOrEntryId } : undefined,
        "toolkit-user"
      );
    },
    [setAnchor]
  );
  return (
    <ActiveToolkitLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      topicOrEntryId={topicOrEntryId}
      onNavigate={handleNavigate}
      toolkit={toolkit}
      direction={direction}
    />
  );
};

interface ActiveToolkitLevelProps extends ReferenceToolkitProps {
  anchor: Anchor | undefined;
  topicOrEntryId: string | undefined;
  onNavigate: (topicOrEntryId: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveToolkitLevel = ({
  anchor,
  topicOrEntryId,
  onNavigate,
  toolkit,
  direction,
}: ActiveToolkitLevelProps) => {
  const [topic, activeItem] = getTopicAndEntry(toolkit, topicOrEntryId);

  if (topic) {
    return (
      <HeadedScrollablePanel
        // Key prop used to ensure scroll position top
        // after using internal link to toolkit topic.
        key={topic.name}
        direction={direction}
        heading={
          <ToolkitBreadcrumbHeading
            parent={toolkit.name}
            title={topic.name}
            onBack={() => onNavigate(undefined)}
            subtitle={topic.subtitle}
            icon={topic.image}
          />
        }
      >
        {topic.introduction && (
          <Box p={5} pb={1} fontSize="sm">
            <ToolkitContent content={topic.introduction} />
          </Box>
        )}
        <List flex="1 1 auto">
          {topic.contents?.map((item) => (
            <ListItem key={item.name}>
              <ToolkitTopicEntry
                topic={topic}
                entry={item}
                anchor={anchor}
                active={activeItem === item}
              />
              <Divider />
            </ListItem>
          ))}
        </List>
      </HeadedScrollablePanel>
    );
  }
  return (
    <HeadedScrollablePanel
      direction={direction}
      heading={
        <AreaHeading name={toolkit.name} description={toolkit.description} />
      }
    >
      <List flex="1 1 auto" m={3}>
        {toolkit.contents?.map((topic) => (
          <ToolkitTopLevelListItem
            key={topic.name}
            name={topic.name}
            isV2Only={isV2Only(topic)}
            description={topic.subtitle}
            icon={topic.image}
            onForward={() => onNavigate(topic.slug.current)}
          />
        ))}
      </List>
    </HeadedScrollablePanel>
  );
};

export default ReferenceToolkit;
