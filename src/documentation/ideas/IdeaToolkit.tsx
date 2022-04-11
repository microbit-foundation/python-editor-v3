/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Stack } from "@chakra-ui/layout";
import { SimpleGrid } from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import { useIntl } from "react-intl";
import AreaHeading from "../../common/AreaHeading";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import { useResizeObserverContentRect } from "../../common/use-resize-observer";
import { flags } from "../../flags";
import { Anchor, RouterParam, useRouterParam } from "../../router-hooks";
import { isV2Only } from "../reference/model";
import { useAnimationDirection } from "../reference/toolkit-hooks";
import ToolkitBreadcrumbHeading from "../reference/ToolkitBreadcrumbHeading";
import ToolkitContent from "../reference/ToolkitContent";
import IdeaTopLevelListItem from "./IdeaTopLevelListItem";
import { Idea } from "./model";

interface IdeaToolkitProps {
  toolkit: Idea[];
}

/**
 * A data-driven toolkit component.
 *
 * The components used here are also used with the API data to
 * generate the API documentation.
 */
const IdeasToolkit = ({ toolkit }: IdeaToolkitProps) => {
  const [anchor, setAnchor] = useRouterParam(RouterParam.idea);
  const direction = useAnimationDirection(anchor);
  const ideaId = anchor?.id;
  const handleNavigate = useCallback(
    (ideaId: string | undefined) => {
      setAnchor(ideaId ? { id: ideaId } : undefined, "toolkit-user");
    },
    [setAnchor]
  );
  return (
    <ActiveToolkitLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      ideaId={ideaId}
      onNavigate={handleNavigate}
      toolkit={toolkit}
      direction={direction}
    />
  );
};

interface ActiveToolkitLevelProps extends IdeaToolkitProps {
  anchor: Anchor | undefined;
  ideaId: string | undefined;
  onNavigate: (ideaId: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveToolkitLevel = ({
  ideaId,
  onNavigate,
  toolkit,
  direction,
}: ActiveToolkitLevelProps) => {
  const activeIdea = toolkit.find((idea) => idea.slug.current === ideaId);
  const intl = useIntl();
  const referenceString = intl.formatMessage({ id: "ideas-tab" });
  const descriptionString = intl.formatMessage({ id: "ideas-tab-description" });
  const ref = useRef<HTMLDivElement>(null);
  const contentRect = useResizeObserverContentRect(ref);
  const contentWidth = contentRect?.width ?? 0;
  const numCols =
    !contentWidth || contentWidth > 1100 ? 3 : contentWidth > 550 ? 2 : 1;
  if (activeIdea && flags.ideas) {
    return (
      <HeadedScrollablePanel
        key={activeIdea.slug.current}
        direction={direction}
        heading={
          <ToolkitBreadcrumbHeading
            parent={referenceString}
            title={activeIdea.name}
            onBack={() => onNavigate(undefined)}
            image={activeIdea.image}
          />
        }
      >
        {activeIdea.content && (
          <Stack spacing={3} fontSize="sm" p={5} pr={3} mt={1} mb={1}>
            <ToolkitContent content={activeIdea.content} />
          </Stack>
        )}
      </HeadedScrollablePanel>
    );
  }
  return (
    <HeadedScrollablePanel
      direction={direction}
      heading={
        <AreaHeading name={referenceString} description={descriptionString} />
      }
    >
      {flags.ideas && (
        <SimpleGrid columns={numCols} spacing={5} p={5} ref={ref}>
          {toolkit.map((idea) => (
            <IdeaTopLevelListItem
              key={idea.name}
              name={idea.name}
              isV2Only={isV2Only(idea)}
              image={idea.image}
              onForward={() => onNavigate(idea.slug.current)}
            />
          ))}
        </SimpleGrid>
      )}
    </HeadedScrollablePanel>
  );
};

export default IdeasToolkit;
