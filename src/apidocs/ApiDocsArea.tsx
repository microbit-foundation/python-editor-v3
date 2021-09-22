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
    <Box height="100%" p={3} pt={4}>
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
      {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
        <DocEntryNode
          key={module.fullName}
          docs={module}
          borderRadius="md"
          _last={{ pb: 4 }}
        />
      ))}
    </>
  );
};

interface DocEntryNodeProps extends BoxProps {
  docs: DocEntry;
}

const kindToFontSize: Record<string, any> = {
  module: "2xl",
  class: "lg",
};

const kindToSpacing: Record<string, any> = {
  module: 8,
  class: 5,
  variable: 3,
  function: 3,
};

const DocEntryNode = ({
  docs: { kind, fullName, children, type, docString },
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
        <Text fontSize={kindToFontSize[kind]}>
          <Text as="span" fontWeight="semibold">
            {formatName(kind, fullName)}
          </Text>
          {nameSuffix(kind, type)}
        </Text>
        {docString && (
          <Text fontSize="sm" mt={2} noOfLines={2}>
            {docString.replaceAll("``", "").replaceAll("**", "")}
          </Text>
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
                  <>
                    <Text fontWeight="lg" mb={2} mt={5}>
                      {groupHeading(kind, childKind)}
                    </Text>
                    {groupedChildren?.get(childKind as any)?.map((c) => (
                      <DocEntryNode key={c.fullName} docs={c} />
                    ))}
                  </>
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
  children: DocEntry[] | undefined
): DocEntry[] | undefined =>
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

const pullModulesToTop = (input: ApiDocsResponse) => {
  const recurse = (docs: DocEntry[], topLevel: boolean) => {
    [...docs].forEach((d, index) => {
      if (d.kind === "module" && !topLevel) {
        input[d.fullName] = d;
        docs.splice(index, 1);
      }
      if (d.children) {
        recurse(d.children, false);
      }
    });
  };
  recurse(Object.values(input), true);
};

export default ApiDocsArea;
