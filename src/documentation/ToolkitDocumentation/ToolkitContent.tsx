/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image } from "@chakra-ui/image";
import { Link } from "@chakra-ui/layout";
import BlockContent from "@sanity/block-content-to-react";
import unconfiguredImageUrlBuilder from "@sanity/image-url";
import { ReactNode } from "react";
import { useRouterState } from "../../router-hooks";
import CodeEmbed from "./CodeEmbed";
import {
  ToolkitApiLink,
  ToolkitCode,
  ToolkitImage,
  ToolkitInternalLink,
  ToolkitPortableText,
} from "./model";

interface ToolkitContentProps {
  content: ToolkitPortableText;
  detail?: boolean;
  hasDetail?: boolean;
  onForward?: () => void;
}

export const defaultQuality = 80;

export const imageUrlBuilder = unconfiguredImageUrlBuilder()
  // Hardcoded for now as there's no practical alternative.
  .projectId("ajwvhvgo")
  .dataset("apps")
  .auto("format")
  .dpr(window.devicePixelRatio ?? 1)
  .quality(defaultQuality);

const ToolkitApiLinkMark = (props: SerializerMarkProps<ToolkitApiLink>) => {
  const [state, setState] = useRouterState();
  return (
    <Link
      color="brand.600"
      onClick={(e) => {
        e.preventDefault();
        setState({
          ...state,
          tab: "reference",
          reference: props.mark.name,
        });
      }}
    >
      {props.children}
    </Link>
  );
};

const ToolkitInternalLinkMark = (
  props: SerializerMarkProps<ToolkitInternalLink>
) => {
  const [state, setState] = useRouterState();
  return (
    <Link
      color="brand.600"
      onClick={(e) => {
        e.preventDefault();
        setState({
          ...state,
          // Hmm, we need to know the tab/toolkit (we should name them the same).
          // We also need to switch to router-based navigation for the other toolkits.
        });
      }}
    >
      {props.children}
    </Link>
  );
};

interface SerializerNodeProps<T> {
  node: T;
}

interface HasChildren {
  children: ReactNode;
}

interface SerializerMarkProps<T> extends HasChildren {
  mark: T;
}

const ToolkitContent = ({ content, ...outerProps }: ToolkitContentProps) => {
  const serializers = {
    // This is a serializer for the wrapper element.
    // We use a fragment so we can use spacing from the context into which we render.
    container: (props: HasChildren) => <>{props.children}</>,
    types: {
      python: ({ node: { main } }: SerializerNodeProps<ToolkitCode>) => (
        <CodeEmbed code={main} {...outerProps} />
      ),
      simpleImage: (props: SerializerNodeProps<ToolkitImage>) => {
        return (
          <Image
            src={imageUrlBuilder
              .image(props.node.asset)
              .width(300)
              .fit("max")
              .url()}
            alt={props.node.alt}
            w="300px"
          />
        );
      },
    },
    marks: {
      toolkitInternalLink: ToolkitInternalLinkMark,
      toolkitApiLink: ToolkitApiLinkMark,
    },
  };
  return <BlockContent blocks={content} serializers={serializers} />;
};

export default ToolkitContent;
