/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon } from "@chakra-ui/icon";
import { Image } from "@chakra-ui/image";
import { Box, Link, Stack, Text } from "@chakra-ui/layout";
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
import OfflineImageFallback from "../OfflineImageFallback";

export const enum DocumentationCollapseMode {
  ShowAll,
  ExpandCollapseAll,
  ExpandCollapseExceptCode,
  ExpandCollapseExceptCodeAndFirstLine,
}

interface DocumentationContentProps {
  content?: PortableText;
  details?: DocumentationCollapseMode;
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
          slug: { id: props.mark.name },
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
            slug: {
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
      <Icon
        mb={1 / 3 + "em"}
        ml={1}
        verticalAlign="middle"
        as={RiExternalLinkLine}
      />
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
      startingHeight={collapseToFirstLine ? "1.9725rem" : undefined}
    >
      <Stack spacing={3} pt={3} noOfLines={justFirstLine ? 1 : undefined}>
        <BlockContent blocks={children} serializers={serializers} />
      </Stack>
    </Collapse>
  );
};

const ContextualCodeEmbed = ({ code }: { code: string }) => {
  const context = useCodeEmbedContext();
  return (
    <Box mt={3}>
      <CodeEmbed {...context} code={code} />
    </Box>
  );
};

// We use context for information that would otherwise
// require us to recreate serializers to avoid elements
// being recreated that would break animations.
const serializers = {
  // This is a serializer for the wrapper element.
  // We use a fragment so we can use spacing from the context into which we render.
  container: ({ children }: HasChildren) => <>{children}</>,
  types: {
    block: (props: { node: { style: string }; children: any }) => {
      let style = props.node.style;
      if (/^h\d/.test(style)) {
        return (
          // For the moment we only support a h3 in ideas.
          <Text as={style as any} fontSize="lg" fontWeight="semibold">
            {props.children}
          </Text>
        );
      }
      return BlockContent.defaultSerializers.types.block(props);
    },
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
      const imageProps = {
        width: 300,
        borderRadius: "lg",
        border: "solid 1px",
        borderColor: "gray.300",
        sx: {
          aspectRatio: getAspectRatio(props.node.asset._ref),
        },
      };
      return (
        <Image
          src={imageUrlBuilder
            .image(props.node.asset)
            .width(300)
            .fit("max")
            .url()}
          ignoreFallback={navigator.onLine}
          fallback={<OfflineImageFallback {...imageProps} />}
          alt={props.node.alt}
          {...imageProps}
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
  details = DocumentationCollapseMode.ShowAll,
}: DocumentationContentProps) => {
  // If we're expanding or collapsing then we pre-process the content to wrap every run of non-code in Collapse.
  content = useMemo(() => {
    if (details === DocumentationCollapseMode.ShowAll) {
      return content || [];
    }
    return decorateWithCollapseNodes(content, details);
  }, [details, content]);

  const rendered = <BlockContent blocks={content} serializers={serializers} />;
  return details === DocumentationCollapseMode.ShowAll ? (
    <Stack spacing={3} mt={3}>
      {rendered}
    </Stack>
  ) : (
    rendered
  );
};

export default React.memo(DocumentationContent);
