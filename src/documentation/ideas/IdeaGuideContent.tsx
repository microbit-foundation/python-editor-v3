/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { CSSProperties } from "react";
import { Box } from "styled-system/jsx";
import { runtimeAspectRatioClass } from "../../common/documentation-styles";
import {
  getAspectRatioPadding,
  imageUrlBuilder,
} from "../../common/imageUrlBuilder";
import DocumentationContent, {
  DocumentationContextProvider,
} from "../common/DocumentationContent";
import ImageWithFallback from "../common/ImageWithFallback";
import OfflineImageFallback from "../OfflineImageFallback";
import { withoutCode } from "./idea-code";
import { Idea } from "./model";

interface IdeaGuideContentProps {
  idea: Idea;
  /**
   * In the editor's guide panel: with the idea's image, and links to
   * Reference and API. False in the home page's idea dialog.
   */
  inEditor?: boolean;
}

/**
 * An idea's content without its program, for the guide panel and the home
 * page's idea dialog. Callers supply the surrounding stack and
 * docStylesClass.
 */
const IdeaGuideContent = ({ idea, inEditor = true }: IdeaGuideContentProps) => {
  // Runtime value derived from the image reference.
  const imagePadding = idea.image
    ? getAspectRatioPadding(idea.image.asset._ref)
    : undefined;
  return (
    <>
      {inEditor && idea.image && (
        <Box
          width="600px"
          maxWidth="100%"
          className={imagePadding ? runtimeAspectRatioClass : undefined}
          style={{ "--aspect-ratio-padding": imagePadding } as CSSProperties}
        >
          <ImageWithFallback
            src={imageUrlBuilder.image(idea.image.asset).fit("max").url()}
            ignoreFallback={navigator.onLine}
            fallback={<OfflineImageFallback width={600} />}
            alt=""
            borderTopRadius="lg"
          />
        </Box>
      )}
      <DocumentationContextProvider
        parentSlug={idea.slug.current}
        toolkitType="ideas"
        editorLinks={inEditor}
      >
        <DocumentationContent blocks={withoutCode(idea.content)} />
      </DocumentationContextProvider>
    </>
  );
};

export default IdeaGuideContent;
