/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect, useRef } from "react";
import { usePrevious } from "@chakra-ui/hooks";
import { Box, List } from "@chakra-ui/layout";
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
    previousParam.length === 0 && urlParam.length > 0
      ? "forward"
      : previousParam.length > 0 && urlParam.length === 0
      ? "back"
      : "none";

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
  const scrollElement: any = useRef(null);
  const scrollToElement = () =>
    scrollElement.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });

  // scrolling works, but top of topic is hidden by ToolkitBreadcrumbHeading
  useEffect(() => {
    if (scrollElement.current) {
      scrollToElement();
    }
  }, [scrollElement]);

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
            <ToolkitListItem key={item.name}>
              <TopicItem
                topic={topic}
                item={item}
                detail={activeItem === item}
                onForward={() =>
                  onNavigate({
                    topicId: topic.name,
                    itemId: item.name,
                  })
                }
                onBack={() => onNavigate({ topicId: topic.name })}
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
