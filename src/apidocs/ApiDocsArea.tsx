import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import { Button } from "@chakra-ui/button";
import { Box, BoxProps, HStack, Text, VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import sortBy from "lodash.sortby";
import React, { useEffect, useMemo, useState } from "react";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { renderMarkdown } from "../editor/codemirror/language-server/documentation";
import {
  apiDocs,
  ApiDocsBaseClass,
  ApiDocsEntry,
  ApiDocsFunctionParameter,
  ApiDocsResponse,
} from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import { pullModulesToTop } from "./apidocs-util";

const ApiDocsArea = () => {
  const client = useLanguageServerClient();
  const [apidocs, setApiDocs] = useState<ApiDocsResponse | undefined>();
  useEffect(() => {
    const load = async () => {
      if (client) {
        await client.initialize();
        const docs = await apiDocs(client);
        pullModulesToTop(docs);
        setApiDocs(docs);
      }
    };
    load();
  }, [client]);
  return (
    <Box height="100%" p={2}>
      {apidocs ? (
        <ModuleDocs docs={apidocs} />
      ) : (
        <Spinner label="Loading API documentation" alignSelf="center" />
      )}
    </Box>
  );
};

interface ModuleDocsProps {
  docs: ApiDocsResponse;
}

const ModuleDocs = ({ docs }: ModuleDocsProps) => {
  return (
    <>
      <Accordion
        allowToggle
        wordBreak="break-word"
        position="relative"
        // Animations disabled as they conflict with the sticky heading, as we animate past the sticky point.
        reduceMotion={true}
      >
        {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
          <AccordionItem key={module.id}>
            <AccordionButton
              fontSize="xl"
              backgroundColor="gray.50"
              _expanded={{
                fontWeight: "semibold",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
              // Equivalent to the default alpha but without transparency due to the stickyness.
              _hover={{ backgroundColor: "rgb(225, 226, 226)" }}
            >
              <Box flex="1" textAlign="left" mr={3}>
                <Text as={kindToHeading["module"]}>{module.fullName}</Text>
                {module.docString && <DocString value={module.docString} />}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <DocEntryNode docs={module} heading={false} />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};

const kindToFontSize: Record<string, any> = {
  module: "2xl",
  class: "lg",
};

const kindToHeading: Record<string, any> = {
  module: "h2",
  class: "h3",
  variable: "h4",
  function: "h4",
};

const kindToSpacing: Record<string, any> = {
  module: 5,
  class: 5,
  variable: 3,
  function: 3,
};

interface DocEntryNodeProps extends BoxProps {
  docs: ApiDocsEntry;
  heading?: boolean;
}

const DocEntryNode = ({
  docs: { kind, name, fullName, children, params, docString, baseClasses },
  heading = true,
  mt,
  mb,
  ...others
}: DocEntryNodeProps) => {
  const [isShowingDetail, setShowingDetail] = useState(false);
  const groupedChildren = useMemo(() => {
    const filteredChildren = filterChildren(children);
    return filteredChildren
      ? groupBy(filteredChildren, (c) => c.kind)
      : undefined;
  }, [children]);
  const docStringFirstParagraph = docString
    ? docString.split(/\n{2,}/g)[0]
    : undefined;
  const hasDocStringDetail =
    docString &&
    docStringFirstParagraph &&
    docString.length > docStringFirstParagraph.length;
  const activeDocString = isShowingDetail ? docString : docStringFirstParagraph;
  const { signature, hasSignatureDetail } = buildSignature(
    kind,
    params,
    isShowingDetail
  );
  const hasDetail = hasDocStringDetail || hasSignatureDetail;

  return (
    <Box
      id={fullName}
      wordBreak="break-word"
      mb={kindToSpacing[kind]}
      p={kind === "variable" || kind === "function" ? 2 : undefined}
      backgroundColor={
        kind === "variable" || kind === "function" ? "gray.10" : undefined
      }
      borderRadius="md"
      {...others}
    >
      {heading && (
        <Box>
          <Text fontSize={kindToFontSize[kind]} as={kindToHeading[kind]}>
            <Text as="span" fontWeight="semibold">
              {formatName(kind, fullName, name)}
            </Text>
            {signature}
          </Text>
          {baseClasses && baseClasses.length > 0 && (
            <BaseClasses value={baseClasses} />
          )}
          <VStack alignItems="stretch" spacing={1}>
            {activeDocString && <DocString value={activeDocString} />}
            {kind !== "module" && kind !== "class" && (
              <HStack justifyContent="flex-end">
                {hasDetail && (
                  <Button
                    color="unset"
                    variant="link"
                    size="xs"
                    onClick={() => setShowingDetail(!isShowingDetail)}
                    rightIcon={<ExpandCollapseIcon open={isShowingDetail} />}
                    _hover={{
                      textDecoration: "none",
                    }}
                    p={1}
                    pt={1.5}
                    pb={1.5}
                    aria-label={
                      isShowingDetail
                        ? `Show less for ${name}`
                        : `Show more for ${name}`
                    }
                  >
                    {isShowingDetail ? "Show less" : "Show more"}
                  </Button>
                )}
              </HStack>
            )}
          </VStack>
        </Box>
      )}
      {groupedChildren && groupedChildren.size > 0 && (
        <Box pl={kind === "class" ? 2 : 0} mt={3}>
          <Box
            pl={kind === "class" ? 2 : 0}
            borderLeftWidth={kind === "class" ? 1 : undefined}
          >
            {["function", "variable", "class"].map(
              (childKind) =>
                groupedChildren?.get(childKind as any) && (
                  <Box mb={5} key={childKind}>
                    <Text fontWeight="lg" mb={2}>
                      {groupHeading(kind, childKind)}
                    </Text>
                    {groupedChildren?.get(childKind as any)?.map((c) => (
                      <DocEntryNode key={c.id} docs={c} />
                    ))}
                  </Box>
                )
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const groupHeading = (kind: string, childKind: string): string => {
  switch (childKind) {
    case "variable":
      return "Fields";
    case "class":
      return "Classes";
    case "function":
      return kind === "class" ? "Methods" : "Functions";
    default: {
      throw new Error("Unexpected");
    }
  }
};

const formatName = (kind: string, fullName: string, name: string): string => {
  // Add zero width spaces to allow breaking
  return kind === "module" ? fullName.replaceAll(/\./g, "\u200b.\u200b") : name;
};

const buildSignature = (
  kind: string,
  params: ApiDocsFunctionParameter[] | undefined,
  detailed: boolean
): { signature?: string; hasSignatureDetail: boolean } => {
  if (kind === "function" && params) {
    const signature =
      "(" +
      params
        .filter(
          (parameter, index) =>
            !(index === 0 && parameter.name === "self") &&
            (detailed || parameter.defaultValue === undefined)
        )
        .map((parameter) => {
          const prefix =
            parameter.category === "varargDict"
              ? "**"
              : parameter.category === "varargList"
              ? "*"
              : "";
          const suffix = parameter.defaultValue
            ? `=${parameter.defaultValue}`
            : "";
          return prefix + parameter.name + suffix;
        })
        .join(", ") +
      ")";
    return {
      signature,
      hasSignatureDetail: !!params.find((p) => p.defaultValue !== undefined),
    };
  }
  return { signature: undefined, hasSignatureDetail: false };
};

const isInitOrOtherNonDunderMethod = (c: ApiDocsEntry) =>
  !c.name.endsWith("__") || c.name === "__init__";

const filterChildren = (
  children: ApiDocsEntry[] | undefined
): ApiDocsEntry[] | undefined =>
  children ? children.filter(isInitOrOtherNonDunderMethod) : undefined;

function groupBy<T, U>(values: T[], fn: (x: T) => U): Map<U, T[]> {
  const result = new Map<U, T[]>();
  for (const v of values) {
    const k = fn(v);
    let array = result.get(k);
    if (!array) {
      array = [];
      result.set(k, array);
    }
    array.push(v);
  }
  return result;
}

const BaseClasses = ({ value }: { value: ApiDocsBaseClass[] }) => {
  const prefix = value.length === 1 ? "base class " : "base classes: ";
  return (
    <Text pl={2}>
      {prefix}
      {value.map((bc) => (
        <a key={bc.fullName} href={"#" + bc.fullName}>
          {bc.name}
        </a>
      ))}
    </Text>
  );
};

interface DocStringProps {
  value: string;
}

const DocString = React.memo(({ value }: DocStringProps) => {
  const html = renderMarkdown(value);
  return (
    <Box
      className="docs-markdown"
      fontSize="sm"
      mt={2}
      fontWeight="normal"
      dangerouslySetInnerHTML={html}
    />
  );
});

export default ApiDocsArea;
