import { Box, BoxProps, Text, VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useEffect, useState } from "react";
import { apiDocs, ApiDocsResponse, DocEntry } from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import sortBy from "lodash.sortby";

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
    <VStack alignItems="stretch" height="100%" p={2} spacing={5}>
      {apidocs ? (
        sortBy(Object.values(apidocs), (m) => m.fullName).map((module) => (
          <DocEntryNode
            key={module.fullName}
            docs={module}
            backgroundColor="gray.10"
            borderRadius="md"
            pl={3}
            pr={3}
            pt={2}
            pb={2}
          />
        ))
      ) : (
        <Spinner label="Loading API documentation" alignSelf="center" />
      )}
    </VStack>
  );
};

interface DocEntryNodeProps extends BoxProps {
  docs: DocEntry;
}

const DocEntryNode = ({
  docs: { kind, fullName, children, type, docString },
  pt,
  pb,
  ...others
}: DocEntryNodeProps) => {
  if (fullName.endsWith("__") && !fullName.endsWith("__init__")) {
    // Skip dunder methods for now. If we add anything we should recast in
    // terms of the operations they enable.
    return null;
  }

  let suffix = "";
  if (kind === "function") {
    suffix = type || "()";
    suffix = suffix.replace(/ -> None$/, "");
  } else if (kind === "variable") {
    suffix = ": " + type;
  }

  return (
    <VStack
      alignItems="stretch"
      wordBreak="break-word"
      {...others}
      pt={kind === "class" ? 3 : pt}
      pb={kind === "class" ? 3 : pb}
    >
      <div>
        <Text fontSize={kind === "module" ? "2xl" : "medium"}>
          <Text as="span" fontWeight="semibold">
            {kind === "class" ? "class " : ""}
            {
              /* Add zero width spaces to allow breaking*/
              kind === "module"
                ? fullName.replaceAll(/\./g, "\u200b.\u200b")
                : fullName.split(".").slice(-1)
            }
          </Text>
          {suffix}
        </Text>
        {docString && (
          <Text fontSize="sm">
            <DocString value={docString} />
          </Text>
        )}
      </div>
      {children && (
        <Box pl={kind === "class" ? 2 : 0}>
          <VStack
            alignItems="stretch"
            pl={kind === "class" ? 1 : 0}
            borderLeftWidth={kind === "class" ? 1 : undefined}
          >
            {Object.values(children)
              .filter((c) => c.kind !== "module")
              .map((c) => (
                <DocEntryNode key={c.fullName} docs={c} />
              ))}
            {Object.values(children)
              .filter((c) => c.kind === "module")
              .map((c) => (
                <DocEntryNode key={c.fullName} docs={c} />
              ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

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

const DocString = ({ value }: { value: string }) => {
  // Do we tackle restructured text formatting here?
  // Can we convert to plain text in Pyright?
  return <span>{value.replaceAll("``", "").replaceAll("**", "")}</span>;
};

export default ApiDocsArea;
