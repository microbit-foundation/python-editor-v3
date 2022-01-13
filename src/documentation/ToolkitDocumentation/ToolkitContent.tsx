/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import Icon from "@chakra-ui/icon";
import { Image } from "@chakra-ui/image";
import { Link } from "@chakra-ui/layout";
import BlockContent from "@sanity/block-content-to-react";
import unconfiguredImageUrlBuilder from "@sanity/image-url";
import React, { ReactNode } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { useRouterState } from "../../router-hooks";
import CodeEmbed from "./CodeEmbed";
import {
  ToolkitApiLink,
  ToolkitCode,
  ToolkitExternalLink,
  ToolkitImage,
  ToolkitInternalLink,
  ToolkitPortableText,
} from "./model";

interface ToolkitContentProps {
  content: ToolkitPortableText;
}

export const defaultQuality = 80;

const imageUrlBuilder = unconfiguredImageUrlBuilder()
  // Hardcoded for now as there's no practical alternative.
  .projectId("ajwvhvgo")
  .dataset("apps")
  .auto("format")
  .dpr(window.devicePixelRatio ?? 1)
  .quality(defaultQuality);

const getAspectRatio = (imageRef: string): number | undefined => {
  const dimensionsArr = imageRef.match(/\d+x\d+/g);
  if (!dimensionsArr) {
    return undefined;
  }
  const dimensions = dimensionsArr.join().split("x");
  const [width, height] = dimensions.map((n: string) => Number(n));
  return width / height;
};

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
          reference: { id: props.mark.name },
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
          tab: "explore",
          explore: {
            id: props.mark.slug.current,
          },
        });
      }}
    >
      {props.children}
    </Link>
  );
};

const ToolkitExternalLinkMark = (
  props: SerializerMarkProps<ToolkitExternalLink>
) => {
  return (
    <Link
      color="brand.600"
      href={props.mark.href}
      target="_blank"
      rel="nofollow noopener"
    >
      {props.children}
      <Icon mb={1 / 3 + "em"} ml={1} as={RiExternalLinkLine} />
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
        const ratio = getAspectRatio(props.node.asset._ref);
        return (
          <Image
            src={imageUrlBuilder
              .image(props.node.asset)
              .width(300)
              .fit("max")
              .url()}
            alt={props.node.alt}
            w="300px"
            h={ratio ? `${Math.round(300 / ratio)}px` : "auto"}
          />
        );
      },
    },
    marks: {
      toolkitInternalLink: ToolkitInternalLinkMark,
      toolkitApiLink: ToolkitApiLinkMark,
      link: ToolkitExternalLinkMark,
    },
  };
  return <BlockContent blocks={content} serializers={serializers} />;
};

export default React.memo(ToolkitContent);
