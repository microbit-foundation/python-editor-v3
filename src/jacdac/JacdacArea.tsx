/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Icon, List, Tooltip, usePrevious } from "@chakra-ui/react";
import { useCallback, useMemo, useRef } from "react";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { useIntl } from "react-intl";
import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
import { flags } from "../flags";
import { useAnimationDirection } from "../documentation/common/documentation-animation-hooks";
import DocumentationBreadcrumbHeading from "../documentation/common/DocumentationBreadcrumbHeading";
import DocumentationTopLevelItem from "../documentation/common/DocumentationTopLevelItem";
import { useRouterState, useRouterTabSlug } from "../router-hooks";
import { useJacdacSensorServices } from "./jacdac-hooks";
import { jacdacTopics as topics } from "./jacdac-sensor-docs";
import JacdacConfig from "./JacdacConfig";
import JacdacLiveDevice from "./JacdacLiveDevice";
import JacdacSensorContent from "./JacdacSensorContent";
import { JacdacRoleType } from "./parse-roles";

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

  // The read-only "Live device" section is a debugging affordance, shown only
  // when the jacdacDebug flag is present.
  const visibleTopics = useMemo(
    () => topics.filter((t) => t.id !== "live-device" || flags.jacdacDebug),
    []
  );

  // Which sensor types are currently connected, to badge and reorder them.
  const sensors = useJacdacSensorServices();
  const connectedTypes = useMemo(
    () => new Set<JacdacRoleType>(sensors.map((s) => s.supported.type)),
    [sensors]
  );
  const isConnected = useCallback(
    (id: string) => connectedTypes.has(id as JacdacRoleType),
    [connectedTypes]
  );

  // Config stays first; connected sensor sections come next to aid discovery;
  // then everything else keeps its order (stable sort).
  const orderedTopics = useMemo(() => {
    const rank = (id: string) => (id === "config" ? 0 : isConnected(id) ? 1 : 2);
    return [...visibleTopics].sort((a, b) => rank(a.id) - rank(b.id));
  }, [visibleTopics, isConnected]);

  const topicId = anchor?.id.split("/")[0];
  const topic = visibleTopics.find((t) => t.id === topicId);

  // The anchorless top-level list doesn't get a slide from useAnimationDirection.
  // So when the tab is entered (e.g. auto-opened on sensor connect), play the
  // same forward slide as drilling into a section by bumping a remount key.
  // (Drilling into a section already animates via the anchor change above.)
  const [{ tab }] = useRouterState();
  const active = tab === "jacdac";
  const wasActive = usePrevious(active);
  const enteredTab = active && wasActive === false;
  const overviewSlide = useRef(0);
  if (enteredTab) {
    // Safe to mutate in render: it only changes the panel key, forcing a remount.
    overviewSlide.current += 1;
  }

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
            subtitle={topic.description}
            onBack={() => onNavigate(undefined)}
          />
        }
      >
        {topic.id === "config" ? (
          <JacdacConfig />
        ) : topic.id === "live-device" ? (
          <JacdacLiveDevice />
        ) : (
          <JacdacSensorContent topic={topic} anchor={anchor} />
        )}
      </HeadedScrollablePanel>
    );
  }

  return (
    <HeadedScrollablePanel
      key={`overview-${overviewSlide.current}`}
      direction={enteredTab ? "forward" : direction}
    >
      <List flex="1 1 auto">
        {orderedTopics.map((t) => (
          <DocumentationTopLevelItem
            key={t.id}
            name={t.name}
            description={t.description}
            badge={
              isConnected(t.id) ? (
                <Tooltip label={intl.formatMessage({ id: "jacdac-connected" })}>
                  {/* Wrapped in a span so Tooltip has a ref-able child:
                      react-icons components aren't forwardRef. */}
                  <Box
                    as="span"
                    display="inline-flex"
                    color="green.500"
                    aria-label={intl.formatMessage({ id: "jacdac-connected" })}
                  >
                    <Icon as={RiCheckboxCircleFill} boxSize={5} />
                  </Box>
                </Tooltip>
              ) : undefined
            }
            onForward={() => onNavigate(t.id)}
            type="reference"
          />
        ))}
      </List>
    </HeadedScrollablePanel>
  );
};

export default JacdacArea;
