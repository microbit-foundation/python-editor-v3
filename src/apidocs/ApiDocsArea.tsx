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
  const [openId, setOpenId] = useState<string | undefined>(undefined);
  console.log("Rendering top-level", openId);
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
        <ModuleDocs docs={apidocs} openId={openId} setOpenId={setOpenId} />
      ) : (
        <Spinner label="Loading API documentation" alignSelf="center" />
      )}
    </Box>
  );
};

interface ModuleDocsProps {
  openId: string | undefined;
  setOpenId: (id: string | undefined) => void;
  docs: ApiDocsResponse;
}

const ModuleDocs = ({ openId, setOpenId, docs }: ModuleDocsProps) => {
  return (
    <>
      {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
        <DocEntryNode
          key={module.id}
          docs={module}
          borderRadius="md"
          _last={{ pb: 4 }}
          openId={openId}
          setOpenId={setOpenId}
        />
      ))}
    </>
  );
};

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

interface DocEntryNodeProps extends BoxProps {
  docs: ApiDocsEntry;
  openId: string | undefined;
  setOpenId: (id: string | undefined) => void;
}

const DocEntryNode = ({
  openId,
  setOpenId,
  docs: { id, kind, fullName, children, params, docString, baseClasses },
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
            id={id}
            docString={docString}
            openId={openId}
            setOpenId={setOpenId}
          />
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
                  <React.Fragment key={childKind}>
                    <Text fontWeight="lg" mb={2} mt={5}>
                      {groupHeading(kind, childKind)}
                    </Text>
                    {groupedChildren?.get(childKind as any)?.map((c) => (
                      <DocEntryNode
                        key={c.id}
                        docs={c}
                        openId={openId}
                        setOpenId={setOpenId}
                      />
                    ))}
                  </React.Fragment>
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
  id: string;
  docString: string;
  openId: string | undefined;
  setOpenId: (id: string | undefined) => void;
}

const DocString = React.memo(
  ({ id, docString, openId, setOpenId }: DocStringProps) => {
    const firstParagraph = docString.split(/\n{2,}/g)[0];
    const isOpen = openId === id;
    console.log("Rendering with openId = " + openId);
    const html = renderMarkdown(isOpen ? docString : firstParagraph);
    return (
      <VStack alignItems="stretch" spacing={0}>
        <Box
          className="docs-markdown"
          fontSize="sm"
          mt={2}
          fontWeight="normal"
          dangerouslySetInnerHTML={html}
        />
        <HStack justifyContent="flex-end">
          {docString.length > firstParagraph.length && (
            <Button
              color="unset"
              variant="link"
              size="xs"
              onClick={() => setOpenId(isOpen ? undefined : id)}
              rightIcon={<ExpandCollapseIcon open={isOpen} />}
              _hover={{
                textDecoration: "none",
              }}
              p={1}
              pt={1.5}
              pb={1.5}
            >
              {/* TODO: better aria-label with context */}
              {isOpen ? "Collapse details" : "Show details"}
            </Button>
          )}
        </HStack>
      </VStack>
    );
  }
);

export default ApiDocsArea;
