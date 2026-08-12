/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link, Text } from "@microbit/ui";
import { ReactNode, useCallback, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Grid, Stack } from "styled-system/jsx";
import AreaHeading from "../../common/AreaHeading";
import { docStylesClass } from "../../common/documentation-styles";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import { getAspectRatio, imageUrlBuilder } from "../../common/imageUrlBuilder";
import { useResizeObserverContentRect } from "../../common/use-resize-observer";
import { Anchor, useRouterTabSlug } from "../../router-hooks";
import { useAnimationDirection } from "../common/documentation-animation-hooks";
import DocumentationBreadcrumbHeading from "../common/DocumentationBreadcrumbHeading";
import DocumentationContent, {
  DocumentationContextProvider,
} from "../common/DocumentationContent";
import ImageWithFallback from "../common/ImageWithFallback";
import { isV2Only } from "../common/model";
import IdeaCard from "./IdeaCard";
import { Idea } from "./model";
import OfflineImageFallback from "../OfflineImageFallback";
import { microbitOrgMiciProjectsUrl } from "../../external-links";
import { useSettings } from "../../settings/settings";

interface IdeasDocumentationProps {
  ideas: Idea[];
}

const IdeasDocumentation = ({ ideas }: IdeasDocumentationProps) => {
  const [anchor, setAnchor] = useRouterTabSlug("ideas");
  const direction = useAnimationDirection(anchor);
  const ideaId = anchor?.id;
  const handleNavigate = useCallback(
    (ideaId: string | undefined) => {
      setAnchor(ideaId ? { id: ideaId } : undefined, "documentation-user");
    },
    [setAnchor]
  );
  return (
    <ActiveLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      ideaId={ideaId}
      onNavigate={handleNavigate}
      ideas={ideas}
      direction={direction}
    />
  );
};

interface ActiveLevelProps extends IdeasDocumentationProps {
  anchor: Anchor | undefined;
  ideaId: string | undefined;
  onNavigate: (ideaId: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveLevel = ({
  ideaId,
  onNavigate,
  ideas,
  direction,
}: ActiveLevelProps) => {
  const activeIdea = ideas.find((idea) => idea.slug.current === ideaId);
  const intl = useIntl();
  const [{ languageId }] = useSettings();
  const headingString = intl.formatMessage({ id: "ideas-tab" });
  const ref = useRef<HTMLDivElement>(null);
  const contentRect = useResizeObserverContentRect(ref);
  const contentWidth = contentRect?.width ?? 0;
  const numCols =
    !contentWidth || contentWidth > 1100 ? 3 : contentWidth > 550 ? 2 : 1;
  if (activeIdea) {
    return (
      <HeadedScrollablePanel
        key={activeIdea.slug.current}
        direction={direction}
        heading={
          <DocumentationBreadcrumbHeading
            parent={headingString}
            title={activeIdea.name}
            onBack={() => onNavigate(undefined)}
            isV2Only={isV2Only(activeIdea)}
          />
        }
      >
        {activeIdea.content && (
          <Stack
            gap="3"
            fontSize="sm"
            p="5"
            pr="3"
            mt="1"
            mb="1"
            className={docStylesClass}
          >
            {activeIdea.image && (
              <ImageWithFallback
                src={imageUrlBuilder
                  .image(activeIdea.image.asset)
                  .fit("max")
                  .url()}
                ignoreFallback={navigator.onLine}
                fallback={<OfflineImageFallback width={600} />}
                alt=""
                borderTopRadius="lg"
                width="600px"
                // Runtime value derived from the image reference.
                style={{
                  aspectRatio: getAspectRatio(activeIdea.image.asset._ref),
                }}
              />
            )}

            <DocumentationContextProvider
              parentSlug={activeIdea.slug.current}
              toolkitType="ideas"
              title={activeIdea.name}
            >
              <DocumentationContent blocks={activeIdea.content} />
            </DocumentationContextProvider>
          </Stack>
        )}
      </HeadedScrollablePanel>
    );
  }
  return (
    <HeadedScrollablePanel
      direction={direction}
      heading={
        <AreaHeading
          name={headingString}
          description={intl.formatMessage({ id: "ideas-tab-description" })}
        />
      }
    >
      <Grid
        columns={numCols === 3 ? 3 : numCols === 2 ? 2 : 1}
        gap="5"
        p="5"
        ref={ref}
      >
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.name}
            name={idea.name}
            isV2Only={isV2Only(idea)}
            image={idea.image}
            onClick={() => onNavigate(idea.slug.current)}
          />
        ))}
      </Grid>
      <Text pb="8" px="5">
        <FormattedMessage
          id="more-ideas"
          values={{
            link: (chunks: ReactNode) => (
              <Link
                color="brand.500"
                href={microbitOrgMiciProjectsUrl(languageId)}
                target="_blank"
                rel="noopener"
              >
                {chunks}
              </Link>
            ),
          }}
        />
      </Text>
    </HeadedScrollablePanel>
  );
};

export default IdeasDocumentation;
