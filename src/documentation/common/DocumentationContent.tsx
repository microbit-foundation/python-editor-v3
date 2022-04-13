/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import Icon from "@chakra-ui/icon";
import { Image } from "@chakra-ui/image";
import { Link } from "@chakra-ui/layout";
import BlockContent from "@sanity/block-content-to-react";
import React, { ReactNode } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { useRouterState } from "../../router-hooks";
import CodeEmbed from "./CodeEmbed";
import {
  ToolkitApiLink,
  ToolkitCode,
  ToolkitExternalLink,
  ToolkitInternalLink,
} from "../reference/model";
import { getAspectRatio, imageUrlBuilder } from "../../common/imageUrlBuilder";
import { PortableText, SimpleImage } from "../../common/sanity";

interface DocumentationContentProps {
  content?: PortableText;
  parentSlug?: string;
}

const DocumentationApiLinkMark = (
  props: SerializerMarkProps<ToolkitApiLink>
) => {
  const [, setState] = useRouterState();
  return (
    <Link
      color="brand.600"
      onClick={(e) => {
        e.preventDefault();
        setState({
          tab: "api",
          api: { id: props.mark.name },
        });
      }}
    >
      {props.children}
    </Link>
  );
};

const DocumentationInternalLinkMark = (
  props: SerializerMarkProps<ToolkitInternalLink>
) => {
  const [state, setState] = useRouterState();
  return (
    <Link
      color="brand.600"
      onClick={(e) => {
        e.preventDefault();
        setState(
          {
            ...state,
            tab: "reference",
            reference: {
              id: props.mark.slug.current,
            },
          },
          "documentation-user"
        );
      }}
    >
      {props.children}
    </Link>
  );
};

const DocumentationExternalLinkMark = (
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

const DocumentationContent = ({
  content,
  parentSlug,
  ...outerProps
}: DocumentationContentProps) => {
  const serializers = {
    // This is a serializer for the wrapper element.
    // We use a fragment so we can use spacing from the context into which we render.
    container: (props: HasChildren) => <>{props.children}</>,
    types: {
      python: ({ node: { main } }: SerializerNodeProps<ToolkitCode>) => (
        <CodeEmbed code={main} {...outerProps} parentSlug={parentSlug} />
      ),
      simpleImage: (props: SerializerNodeProps<SimpleImage>) => {
        return (
          <Image
            src={imageUrlBuilder
              .image(props.node.asset)
              .width(300)
              .fit("max")
              .url()}
            alt={props.node.alt}
            width={300}
            sx={{ aspectRatio: getAspectRatio(props.node.asset._ref) }}
          />
        );
      },
    },
    marks: {
      toolkitInternalLink: DocumentationInternalLinkMark,
      toolkitApiLink: DocumentationApiLinkMark,
      link: DocumentationExternalLinkMark,
    },
  };
  return content ? (
    <BlockContent blocks={content} serializers={serializers} />
  ) : null;
};

export default React.memo(DocumentationContent);
