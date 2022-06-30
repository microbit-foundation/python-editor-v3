/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import Icon from "@chakra-ui/icon";
import { Image } from "@chakra-ui/image";
import { Link } from "@chakra-ui/layout";
import { Collapse } from "@chakra-ui/react";
import BlockContent from "@sanity/block-content-to-react";
import React, { ReactNode, useMemo } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { getAspectRatio, imageUrlBuilder } from "../../common/imageUrlBuilder";
import { PortableText, SimpleImage } from "../../common/sanity";
import { useRouterState } from "../../router-hooks";
import {
  ToolkitApiLink,
  ToolkitCode,
  ToolkitExternalLink,
  ToolkitInternalLink,
} from "../reference/model";
import { useIsExpanded } from "../reference/ReferenceTopicEntry";
import CodeEmbed from "./CodeEmbed";

export const enum DocumentationDetails {
  AlwaysShown,
  ExpandCollapse,
}

interface DocumentationContentProps {
  content?: PortableText;
  parentSlug?: string;
  toolkitType?: string;
  title?: string;
  details?: DocumentationDetails;
  isExpanded?: boolean;
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

const ContextualCollapse = ({ children }: { children: PortableText }) => {
  const isExpanded = useIsExpanded();
  return (
    <Collapse in={isExpanded}>
      <BlockContent blocks={children} serializers={serializers} />
    </Collapse>
  );
};

const serializers = {
  // This is a serializer for the wrapper element.
  // We use a fragment so we can use spacing from the context into which we render.
  container: ({ children }: HasChildren) => <>{children}</>,
  types: {
    collapse: ({
      node: { children },
    }: SerializerNodeProps<{ children: PortableText }>) => (
      <ContextualCollapse children={children} />
    ),
    python: ({ node: { main } }: SerializerNodeProps<ToolkitCode>) => (
      <CodeEmbed
        code={main}
        parentSlug={"doo"}
        toolkitType={undefined}
        title=""
      />
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

const DocumentationContent = ({
  content,
  details = DocumentationDetails.AlwaysShown,
  isExpanded,
  parentSlug,
  toolkitType,
  title = "",
}: DocumentationContentProps) => {
  // If we're expanding or collapsing then we pre-process the content to wrap every run of non-code in Collapse.
  content = useMemo(() => {
    return details === DocumentationDetails.ExpandCollapse
      ? withCollapseNodes(content)
      : content;
  }, [details, content]);

  return content ? (
    <BlockContent blocks={content} serializers={serializers} />
  ) : null;
};

const withCollapseNodes = (content: PortableText | undefined): PortableText => {
  if (!content || content.length === 0) {
    return [];
  }
  // Collapsing empty paragraphs looks odd but is easy to do by accident in the CMS.
  content = content.filter(
    (b) =>
      b._type !== "block" ||
      (b.children as []).reduce(
        (prev, curr) => prev + (curr as any).text?.length,
        0
      ) > 0
  );

  let result: PortableText = [];
  let currentRun: PortableText = [];
  content.forEach((block, index) => {
    const isLast = index === (content as PortableText).length - 1;
    const isCode = block._type === "python";
    if (!isCode) {
      currentRun.push(block);
    }
    if (isLast || isCode) {
      if (currentRun.length > 0) {
        result.push({
          _type: "collapse",
          children: currentRun,
        });
        currentRun = [];
      }
    }
    if (isCode) {
      result.push(block);
    }
  });
  return result;
};

export default React.memo(DocumentationContent);
