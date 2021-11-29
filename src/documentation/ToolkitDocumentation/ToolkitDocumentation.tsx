/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { usePrevious } from "@chakra-ui/hooks";
import { Box, List, Text } from "@chakra-ui/layout";
import { useCallback } from "react";
import { useRouterParam } from "../../router-hooks";
import { Toolkit, ToolkitNavigationState } from "./model";
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
  const [urlParam = "", setUrlParam] = useRouterParam("explore");
  // Only transitions are up or down levels so can just compare length.
  const previousParam = usePrevious(urlParam) ?? "";
  const direction =
    previousParam.length === urlParam.length
      ? "none"
      : previousParam.length < urlParam.length
      ? "forward"
      : "back";

  const state = parseUrlParam(urlParam);
  const setState = useCallback(
    (state: ToolkitNavigationState) => {
      setUrlParam([state.topicId, state.itemId].filter(Boolean).join("/"));
    },
    [setUrlParam]
  );
  return (
    <ActiveTooklitLevel
      key={urlParam}
      state={state}
      onNavigate={setState}
      toolkit={toolkit}
      direction={direction}
    />
  );
};

const parseUrlParam = (urlParam: string): ToolkitNavigationState => {
  let [topicId, itemId]: Array<string | undefined> = urlParam.split("/");
  if (!topicId) {
    topicId = undefined;
  }
  return {
    topicId,
    itemId,
  };
};

interface ActiveTooklitLevelProps extends ToolkitProps {
  state: ToolkitNavigationState;
  onNavigate: (state: ToolkitNavigationState) => void;
  direction: "forward" | "back" | "none";
}

const ActiveTooklitLevel = ({
  state,
  onNavigate,
  toolkit,
  direction,
}: ActiveTooklitLevelProps) => {
  if (state.topicId && state.itemId) {
    const topic = toolkit.contents?.find((t) => t.name === state.topicId);
    if (topic) {
      const item = topic.contents?.find((i) => i.name === state.itemId);
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
    const topic = toolkit.contents?.find((t) => t.name === state.topicId);
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
          {topic.introduction!.length > 0 &&
            topic.introduction &&
            (typeof topic.introduction === "string" ? (
              <Text p={5} pb={1} fontSize="md">
                {topic.introduction}
              </Text>
            ) : (
              <Box p={5} pb={1} fontSize="md">
                <ToolkitContent content={topic.introduction} />
              </Box>
            ))}
          <List flex="1 1 auto">
            {topic.contents?.map((item) => (
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
        {toolkit.contents?.map((topic) => (
          <ToolkitTopLevelListItem
            key={topic.name}
            name={topic.name}
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
