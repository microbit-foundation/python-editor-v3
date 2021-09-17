import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import { Box, BoxProps, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import sortBy from "lodash.sortby";
import React, { useEffect, useMemo, useState } from "react";
import { apiDocs, ApiDocsResponse, DocEntry } from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";

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
    <Box height="100%">
      {apidocs ? (
        <ModuleDocs docs={apidocs} />
      ) : (
        <Spinner label="Loading API documentation" alignSelf="center" />
      )}
    </Box>
  );
};

const ModuleDocs = ({ docs }: { docs: ApiDocsResponse }) => {
  return (
    <>
      <Accordion allowToggle p={2}>
        {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
          <AccordionItem key={module.fullName}>
            <AccordionButton
              fontSize="xl"
              _expanded={{ fontWeight: "semibold" }}
            >
              <Box flex="1" textAlign="left" mr={3}>
                {module.fullName}
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

interface DocEntryNodeProps extends BoxProps {
  docs: DocEntry;
  heading?: boolean;
}

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

const DocEntryNode = ({
  docs: { kind, fullName, children, type, docString },
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
      wordBreak="break-word"
      mb={kindToSpacing[kind]}
      p={kind === "variable" || kind === "function" ? 2 : undefined}
      backgroundColor={
        kind === "variable" || kind === "function" ? "gray.10" : undefined
      }
      borderRadius="md"
      {...others}
    >
      <Box>
        {heading && (
          <>
            <Text fontSize={kindToFontSize[kind]}>
              <Text as="span" fontWeight="semibold">
                {formatName(kind, fullName)}
              </Text>
              {nameSuffix(kind, type)}
            </Text>
            {docString && <DocString value={docString} />}
          </>
        )}
      </Box>
      {groupedChildren && groupedChildren.size > 0 && (
        <Box pl={kind === "class" ? 2 : 0} mt={3}>
          <Box
            pl={kind === "class" ? 2 : 0}
            borderLeftWidth={kind === "class" ? 1 : undefined}
          >
            {["function", "variable", "class"].map(
              (childKind) =>
                groupedChildren?.get(childKind as any) && (
                  <Box mb={5}>
                    <Text fontWeight="lg" mb={2}>
                      {groupHeading(kind, childKind)}
                    </Text>
                    {groupedChildren?.get(childKind as any)?.map((c) => (
                      <DocEntryNode key={c.fullName} docs={c} />
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

const nameSuffix = (kind: string, type: string | undefined): string => {
  if (kind === "function") {
    return (type || "()").replace(/ -> None$/, "");
  } else if (kind === "variable") {
    return ": " + type;
  }
  return "";
};

const filterChildren = (
  children: Record<string, DocEntry> | undefined
): DocEntry[] | undefined =>
  children
    ? Object.values(children).filter(
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

const pullModulesToTop = (input: ApiDocsResponse) => {
  const recurse = (docs: Record<string, DocEntry>) => {
    Object.entries(docs).forEach(([n, d]) => {
      if (d.kind === "module" && docs !== input) {
        input[d.fullName] = d;
        delete docs[n];
      }
      if (d.children) {
        recurse(d.children);
      }
    });
  };
  recurse(input);
};

const DocString = ({ value }: { value: string }) => (
  <Text fontSize="sm" mt={2} noOfLines={2} fontWeight="normal">
    {value.replaceAll("``", "").replaceAll("**", "")}
  </Text>
);

export default ApiDocsArea;
