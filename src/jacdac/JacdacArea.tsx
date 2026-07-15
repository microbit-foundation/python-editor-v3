/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List } from "@chakra-ui/react";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
import { useAnimationDirection } from "../documentation/common/documentation-animation-hooks";
import DocumentationBreadcrumbHeading from "../documentation/common/DocumentationBreadcrumbHeading";
import DocumentationTopLevelItem from "../documentation/common/DocumentationTopLevelItem";
import { useRouterTabSlug } from "../router-hooks";
import { jacdacTopics as topics } from "./jacdac-sensor-docs";
import JacdacConfig from "./JacdacConfig";
import JacdacLiveDevice from "./JacdacLiveDevice";
import JacdacSensorContent from "./JacdacSensorContent";

/**
 * The Jacdac sidebar section ("code view"): a top-level list of topics
 * (Config + the supported sensors), each opening its own panel. Matches the
 * reference/API sidebar sections in style but with local content.
 */
const JacdacArea = () => {
  const [anchor, setAnchor] = useRouterTabSlug("jacdac");
  const direction = useAnimationDirection(anchor);
  const intl = useIntl();
  const jacdacString = intl.formatMessage({ id: "jacdac-tab" });

  const topicId = anchor?.id.split("/")[0];
  const topic = topics.find((t) => t.id === topicId);

  const onNavigate = useCallback(
    (id: string | undefined) =>
      setAnchor(id ? { id } : undefined, "documentation-user"),
    [setAnchor]
  );

  if (topic) {
    return (
      <HeadedScrollablePanel
        key={topic.id}
        direction={direction}
        heading={
          <DocumentationBreadcrumbHeading
            parent={jacdacString}
            title={topic.name}
            onBack={() => onNavigate(undefined)}
          />
        }
      >
        {topic.id === "config" ? (
          <JacdacConfig />
        ) : topic.id === "live-device" ? (
          <JacdacLiveDevice />
        ) : (
          <JacdacSensorContent topic={topic} />
        )}
      </HeadedScrollablePanel>
    );
  }

  return (
    <HeadedScrollablePanel direction={direction}>
      <List flex="1 1 auto">
        {topics.map((t) => (
          <DocumentationTopLevelItem
            key={t.id}
            name={t.name}
            description={t.description}
            onForward={() => onNavigate(t.id)}
            type="reference"
          />
        ))}
      </List>
    </HeadedScrollablePanel>
  );
};

export default JacdacArea;
