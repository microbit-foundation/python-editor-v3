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
                {module.fullName}
                {module.docString && (
                  <DocString
                    name={module.fullName}
                    details={false}
                    docString={module.docString}
                  />
                )}
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
  const groupedChildren = useMemo(() => {
    const filteredChildren = filterChildren(children);
    return filteredChildren
      ? groupBy(filteredChildren, (c) => c.kind)
      : undefined;
  }, [children]);

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
          <Text fontSize={kindToFontSize[kind]}>
            <Text as="span" fontWeight="semibold">
              {formatName(kind, fullName)}
            </Text>
            {nameSuffix(kind, params)}
          </Text>

          {baseClasses && baseClasses.length > 0 && (
            <BaseClasses value={baseClasses} />
          )}
          {docString && (
            <DocString
              name={name}
              details={kind !== "module" && kind !== "class"}
              docString={docString}
            />
          )}
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

const formatName = (kind: string, fullName: string): string => {
  // Add zero width spaces to allow breaking
  return kind === "module"
    ? fullName.replaceAll(/\./g, "\u200b.\u200b")
    : fullName.split(".").slice(-1)[0];
};

const nameSuffix = (
  kind: string,
  params: ApiDocsFunctionParameter[] | undefined
): string => {
  if (kind === "function" && params) {
    return (
      "(" +
      params
        .filter(
          (parameter, index) => !(index === 0 && parameter.name === "self")
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
      ")"
    );
  }
  return "";
};

const filterChildren = (
  children: ApiDocsEntry[] | undefined
): ApiDocsEntry[] | undefined =>
  children
    ? children.filter(
        (c) => !(c.fullName.endsWith("__") && !c.fullName.endsWith("__init__"))
      )
    : undefined;

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
  name: string;
  docString: string;
  details: boolean;
}

const DocString = React.memo(({ name, details, docString }: DocStringProps) => {
  const firstParagraph = docString.split(/\n{2,}/g)[0];
  const [isOpen, setOpen] = useState(false);
  const html = renderMarkdown(isOpen ? docString : firstParagraph);
  return (
    <VStack alignItems="stretch" spacing={1}>
      <Box
        className="docs-markdown"
        fontSize="sm"
        mt={2}
        fontWeight="normal"
        dangerouslySetInnerHTML={html}
      />
      {details && (
        <HStack justifyContent="flex-end">
          {docString.length > firstParagraph.length && (
            <Button
              color="unset"
              variant="link"
              size="xs"
              onClick={() => setOpen(!isOpen)}
              rightIcon={<ExpandCollapseIcon open={isOpen} />}
              _hover={{
                textDecoration: "none",
              }}
              p={1}
              pt={1.5}
              pb={1.5}
              aria-label={
                isOpen
                  ? `Collapse details for ${name}`
                  : `Show details for ${name}`
              }
            >
              {isOpen ? "Show less" : "Show more"}
            </Button>
          )}
        </HStack>
      )}
    </VStack>
  );
});

export default ApiDocsArea;
