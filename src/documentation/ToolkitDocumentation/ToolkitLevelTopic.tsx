/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, List } from "@chakra-ui/layout";
import { Toolkit, ToolkitNavigationState, ToolkitTopic } from "./model";
import ToolkitBreadcrumbHeading from "./ToolkitBreadcrumbHeading";
import ToolkitLevel from "./ToolkitLevel";
import ToolkitListItem from "./ToolkitListItem";
import TopicItem from "./TopicItem";

interface ToolkitLevelTopicProps extends BoxProps {
  toolkit: Toolkit;
  topic: ToolkitTopic;
  onNavigate: (next: ToolkitNavigationState) => void;
}

const ToolkitLevelTopic = ({
  toolkit,
  topic,
  onNavigate,
  ...props
}: ToolkitLevelTopicProps) => {
  const { contents } = topic;
  return (
    <ToolkitLevel
      heading={
        <ToolkitBreadcrumbHeading
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

export default ToolkitLevelTopic;
