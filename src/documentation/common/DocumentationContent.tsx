/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import Icon from "@chakra-ui/icon";
import { Image } from "@chakra-ui/image";
import { Link, Text } from "@chakra-ui/layout";
import { Collapse } from "@chakra-ui/react";
import BlockContent from "@sanity/block-content-to-react";
import React, { ReactNode, useContext, useMemo } from "react";
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
import CodeEmbed from "./CodeEmbed";
import { decorateWithCollapseNodes } from "./collapse-util";

export const enum DocumentationDetails {
  AlwaysShown,
  ExpandCollapse,
  FirstLineExpandCollapse,
}

interface DocumentationContentProps {
  content?: PortableText;
  details?: DocumentationDetails;
}

interface DocumentationContextValue {
  isExpanded?: boolean;
  parentSlug?: string;
  toolkitType?: string;
  title?: string;
}

const DocumentationContext = React.createContext<DocumentationContextValue>({});

export const DocumentationContextProvider = ({
  children,
  ...other
}: DocumentationContextValue & { children: ReactNode }) => {
  return (
    <DocumentationContext.Provider value={other}>
      {children}
    </DocumentationContext.Provider>
  );
};

const useIsExpanded = () => {
  return useContext(DocumentationContext).isExpanded;
};

const useCodeEmbedContext = () => {
  const { parentSlug, toolkitType, title } = useContext(DocumentationContext);
  return { parentSlug, toolkitType, title };
};

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

const ContextualCollapse = ({
  children,
  collapseToFirstLine,
}: {
  children: PortableText;
  collapseToFirstLine: boolean;
}) => {
  const isExpanded = useIsExpanded();
  const justFirstLine = collapseToFirstLine && !isExpanded;
  return (
    <Collapse
      in={isExpanded}
      startingHeight={collapseToFirstLine ? "1.3125rem" : undefined}
    >
      <Text as="div" noOfLines={justFirstLine ? 1 : undefined}>
        <BlockContent blocks={children} serializers={serializers} />
      </Text>
    </Collapse>
  );
};

const ContextualCodeEmbed = ({ code }: { code: string }) => {
  const context = useCodeEmbedContext();
  return <CodeEmbed {...context} code={code} />;
};

// We use context for information that would otherwise
// require us to recreate serializers to avoid elements
// being recreated that would break animations.
const serializers = {
  // This is a serializer for the wrapper element.
  // We use a fragment so we can use spacing from the context into which we render.
  container: ({ children }: HasChildren) => <>{children}</>,
  types: {
    collapse: ({
      node,
    }: SerializerNodeProps<{
      children: PortableText;
      collapseToFirstLine: boolean;
    }>) => <ContextualCollapse {...node} />,
    python: ({ node: { main } }: SerializerNodeProps<ToolkitCode>) => (
      <ContextualCodeEmbed code={main} />
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

/**
 * Wrap with DocumentationContextProvider for linking and other contextual behaviours.
 */
const DocumentationContent = ({
  content,
  details = DocumentationDetails.AlwaysShown,
}: DocumentationContentProps) => {
  // If we're expanding or collapsing then we pre-process the content to wrap every run of non-code in Collapse.
  content = useMemo(() => {
    switch (details) {
      case DocumentationDetails.ExpandCollapse:
        return decorateWithCollapseNodes(content, false);
      case DocumentationDetails.FirstLineExpandCollapse:
        return decorateWithCollapseNodes(content, true);
      default:
        return content;
    }
  }, [details, content]);

  return content ? (
    <BlockContent blocks={content} serializers={serializers} />
  ) : null;
};

export default React.memo(DocumentationContent);
