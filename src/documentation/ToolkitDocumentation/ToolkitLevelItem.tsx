/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps } from "@chakra-ui/layout";
import {
  Toolkit,
  ToolkitNavigationState,
  ToolkitTopic,
  ToolkitTopicItem,
} from "./model";
import ToolkitBreadcrumbHeading from "./ToolkitBreadcrumbHeading";
import ToolkitLevel from "./ToolkitLevel";
import TopicItem from "./TopicItem";

interface ToolkitLevelItemProps extends BoxProps {
  toolkit: Toolkit;
  topic: ToolkitTopic;
  item: ToolkitTopicItem;
  onNavigate: (next: ToolkitNavigationState) => void;
}

const ToolkitLevelItem = ({
  toolkit,
  topic,
  item,
  onNavigate,
  ...props
}: ToolkitLevelItemProps) => {
  return (
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

export default ToolkitLevelItem;
