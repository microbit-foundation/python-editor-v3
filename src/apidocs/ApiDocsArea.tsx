import { Button } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import { Box, BoxProps, HStack, Text, VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import sortBy from "lodash.sortby";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdDragHandle } from "react-icons/md";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import {
  CodeWithImports,
  pythonWithImportsMediaType,
} from "../editor/codemirror/dnd";
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

const classToInstanceMap: Record<string, string> = {
  Button: "button_a",
  MicroBitDigitalPin: "pin0",
  MicroBitTouchPin: "pin0",
  MicroBitAnalogDigitalPin: "pin0",
  Image: "Image.HEART",
};

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

interface ModuleDocsProps {
  docs: ApiDocsResponse;
}

const ModuleDocs = ({ docs }: ModuleDocsProps) => {
  return (
    <>
      {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
        <DocEntryNode
          key={module.id}
          docs={module}
          borderRadius="md"
          _last={{ pb: 4 }}
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
}

const DocEntryNode = ({
  docs: { kind, name, fullName, children, params, docString, baseClasses },
  mt,
  mb,
  ...others
}: DocEntryNodeProps) => {
  const functionOrVariable = kind === "variable" || kind === "function";
  const groupedChildren = useMemo(() => {
    const filteredChildren = filterChildren(children);
    return filteredChildren
      ? groupBy(filteredChildren, (c) => c.kind)
      : undefined;
  }, [children]);
  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      const parts = fullName.split(".");
      const isMicrobit = parts[0] === "microbit";
      let use = isMicrobit ? parts.slice(1) : parts
      use = use.map((p) => classToInstanceMap[p] ?? p);
      const requiredImport = isMicrobit ? { module: "microbit", name: "*"} : { module: parts[0] };
      const codeWithImports: CodeWithImports = {
        code: use.join(".") + (kind === "function" ? "()" : ""),
        requiredImport
      };
      event.dataTransfer.setData(
        pythonWithImportsMediaType,
        JSON.stringify(codeWithImports)
      );
    },
    [fullName, kind]
  );
  return (
    <Box
      id={fullName}
      wordBreak="break-word"
      mb={kindToSpacing[kind]}
      p={functionOrVariable ? 2 : undefined}
      backgroundColor={functionOrVariable ? "gray.10" : undefined}
      borderRadius="md"
      {...others}
    >
      <Box>
        <HStack
          draggable={functionOrVariable}
          onDragStart={handleDragStart}
          fontSize={kindToFontSize[kind]}
        >
          <Text flex="1 1 auto">
            <Text as="span" fontWeight="semibold">
              {formatName(kind, fullName)}
            </Text>
            {nameSuffix(kind, params)}
          </Text>
          {functionOrVariable && (
            <Icon as={MdDragHandle} transform="rotate(90deg) scaleX(1.5)" />
          )}
        </HStack>

        {baseClasses && baseClasses.length > 0 && (
          <BaseClasses value={baseClasses} />
        )}
        {docString && (
          <DocString
            name={name}
            details={functionOrVariable}
            docString={docString}
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
                      <DocEntryNode key={c.id} docs={c} />
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
              {isOpen ? "Collapse details" : "Show details"}
            </Button>
          )}
        </HStack>
      )}
    </VStack>
  );
});

export default ApiDocsArea;
