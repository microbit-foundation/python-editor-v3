/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, HStack, Stack, Text, VStack } from "@chakra-ui/layout";
import { Collapse, useDisclosure } from "@chakra-ui/react";
import { default as React, ReactNode, useCallback, useMemo } from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import {
  debug as dndDebug,
  DragContext,
  setDragContext,
} from "../../editor/codemirror/dnd";
import { splitDocString } from "../../editor/codemirror/language-server/docstrings";
import {
  ApiDocsBaseClass,
  ApiDocsEntry,
  ApiDocsFunctionParameter,
} from "../../language-server/apidocs";
import { useLogging } from "../../logging/logging-hooks";
import { Anchor } from "../../router-hooks";
import DocString from "../common/DocString";
import DragHandle from "../common/DragHandle";
import ShowMoreButton from "../common/ShowMoreButton";
import { allowWrapAtPeriods } from "../common/wrap";
import { useCodeDragImage } from "../documentation-hooks";
import Highlight from "../reference/Highlight";

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
  variable: 4,
  function: 4,
};

export const classToInstanceMap: Record<string, string> = {
  Button: "button_a",
  MicroBitDigitalPin: "pin0",
  MicroBitTouchPin: "pin0",
  MicroBitAnalogDigitalPin: "pin0",
  Image: "Image.HEART",
};

interface ApiDocEntryNodeProps extends BoxProps {
  docs: ApiDocsEntry;
  anchor?: Anchor;
  parentType?: string;
}

const ApiNode = ({
  anchor,
  docs,
  parentType,
  ...props
}: ApiDocEntryNodeProps) => {
  const { id, kind } = docs;
  // Numeric suffixes are used for overrides but links may omit them when
  // a specific override is not known and we should match the first only.
  const active = anchor && (anchor.id === id || anchor.id + "-1" === id);
  const disclosure = useDisclosure();
  return (
    <Highlight anchor={anchor} active={active} id={id} disclosure={disclosure}>
      <Stack
        wordBreak="break-word"
        fontSize="sm"
        spacing={3}
        // Reduce padding inside a class.
        pt={kindToSpacing[kind] - (parentType === "class" ? 1 : 0)}
        pb={kindToSpacing[kind] - (parentType === "class" ? 2 : 1)}
        pl={5}
        pr={0}
        mt={1}
        mb={1}
        {...props}
      >
        <ApiNodeSelf
          docs={docs}
          showMore={disclosure.isOpen}
          onToggleShowMore={disclosure.onToggle}
        />
        <ApiNodeChildren docs={docs} anchor={anchor} />
      </Stack>
    </Highlight>
  );
};

interface ApiNodeSelfProps {
  docs: ApiDocsEntry;
  showMore: boolean;
  onToggleShowMore: () => void;
}

/**
 * The current node's details, not its children.
 */
const ApiNodeSelf = ({
  docs,
  showMore,
  onToggleShowMore,
}: ApiNodeSelfProps) => {
  const { name, fullName, kind, params, baseClasses, docString } = docs;
  const { signature, hasSignatureDetail } = buildSignature(
    kind,
    params,
    showMore
  );
  const [docStringFirstParagraph, docStringRemainder] = useMemo(
    () => (docString ? splitDocString(docString) : [undefined, undefined]),
    [docString]
  );
  const hasDocStringDetail =
    docStringRemainder && docStringRemainder.length > 0;

  return (
    <VStack alignItems="stretch" spacing={3} pr={3}>
      {kind === "function" || kind === "variable" ? (
        <DraggableSignature
          signature={signature}
          docs={docs}
          alignSelf="flex-start"
        />
      ) : (
        <Text
          fontFamily="code"
          fontSize={kindToFontSize[kind] || "md"}
          as={kindToHeading[kind]}
        >
          <Text as="span">{formatName(kind, fullName, name)}</Text>
          {signature}
        </Text>
      )}

      {baseClasses && baseClasses.length > 0 && (
        <BaseClasses value={baseClasses} />
      )}
      {docStringFirstParagraph && (
        <DocString fontWeight="normal" value={docStringFirstParagraph ?? ""} />
      )}
      {(hasDocStringDetail || hasSignatureDetail) && (
        <>
          <ShowMoreButton onClick={onToggleShowMore} isOpen={showMore} />
          {hasDocStringDetail && (
            // Avoid VStack spacing here so the margin animates too.
            <Collapse in={showMore} style={{ marginTop: 0 }}>
              <DocString
                fontWeight="normal"
                value={docStringRemainder}
                mt={3}
              />
            </Collapse>
          )}
        </>
      )}
    </VStack>
  );
};

interface ApiNodeChildrenProps {
  anchor: Anchor | undefined;
  docs: ApiDocsEntry;
}

const ApiNodeChildren = ({ docs, anchor }: ApiNodeChildrenProps) => {
  const { kind, children } = docs;
  const intl = useIntl();
  const groupedChildren = useMemo(() => {
    const filteredChildren = filterChildren(children);
    return filteredChildren
      ? groupBy(filteredChildren, (c) => c.kind)
      : undefined;
  }, [children]);

  return groupedChildren && groupedChildren.size > 0 ? (
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
                  {groupHeading(intl, kind, childKind)}
                </Text>
                {groupedChildren?.get(childKind as any)?.map((c) => (
                  <ApiNode
                    anchor={anchor}
                    key={c.id}
                    docs={c}
                    parentType={docs.kind}
                  />
                ))}
              </Box>
            )
        )}
      </Box>
    </Box>
  ) : null;
};

const groupHeading = (
  intl: IntlShape,
  kind: string,
  childKind: string
): string => {
  switch (childKind) {
    case "variable":
      return intl.formatMessage({ id: "apidocs-fields" });
    case "class":
      return intl.formatMessage({ id: "apidocs-classes" });
    case "function":
      return intl.formatMessage({
        id: kind === "class" ? "apidocs-methods" : "apidocs-functions",
      });
    default: {
      throw new Error("Unexpected");
    }
  }
};

const formatName = (kind: string, fullName: string, name: string): string => {
  return kind === "module" ? allowWrapAtPeriods(fullName) : name;
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
  return (
    <Text pl={2}>
      <FormattedMessage
        id="apidocs-baseclass"
        values={{ baseClassCount: value.length }}
      />{" "}
      {value.map((bc) => (
        <a key={bc.fullName} href={"#" + bc.fullName}>
          {bc.name}
        </a>
      ))}
    </Text>
  );
};

export const getDragContext = (fullName: string, kind: string): DragContext => {
  const parts = fullName
    .split(".")
    .map((p) => (kind === "variable" ? p : classToInstanceMap[p] ?? p))
    .filter((p) => p !== "__init__");
  const isMicrobit = parts[0] === "microbit";
  const nameAsWeImportIt = isMicrobit ? parts.slice(1) : parts;
  const code = nameAsWeImportIt.join(".") + (kind === "function" ? "()" : "");
  const requiredImport = isMicrobit
    ? `from microbit import *`
    : `import ${parts[0]}`;
  const full = `${requiredImport}\n${code}`;
  return {
    code: full,
    type: kind === "function" ? "call" : "example",
    id: fullName,
  };
};

interface DraggableSignatureProps extends BoxProps {
  signature: ReactNode;
  docs: ApiDocsEntry;
}

const DraggableSignature = ({
  signature,
  docs,
  ...props
}: DraggableSignatureProps) => {
  const { fullName, kind, name, id } = docs;
  const logging = useLogging();
  const dragImage = useCodeDragImage();
  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      logging.event({
        type: "code-drag",
        message: id,
      });
      dndDebug("dragstart");
      event.dataTransfer.dropEffect = "copy";
      const context = getDragContext(fullName, kind);
      setDragContext(context);
      event.dataTransfer.setData(pythonSnippetMediaType, context.code);
      if (dragImage.current) {
        event.dataTransfer.setDragImage(dragImage.current, 0, 0);
      }
    },
    [fullName, kind, id, dragImage, logging]
  );

  const handleDragEnd = useCallback((event: React.DragEvent) => {
    dndDebug("dragend");
    setDragContext(undefined);
  }, []);

  const highlight = useDisclosure();
  return (
    <HStack
      draggable
      spacing={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      display="inline-flex"
      overflow="hidden"
      borderWidth="1px"
      borderColor="blimpTeal.300"
      borderRadius="lg"
      onMouseEnter={highlight.onOpen}
      onMouseLeave={highlight.onClose}
      {...props}
      cursor="grab"
    >
      <DragHandle
        highlight={highlight.isOpen}
        borderTopLeftRadius="lg"
        borderBottomLeftRadius="lg"
        p={1}
        alignSelf="stretch"
      />
      <Text
        background={highlight.isOpen ? "blimpTeal.50" : "white"}
        transition="background .2s"
        p={2}
        fontFamily="code"
        fontSize={kindToFontSize[kind] || "md"}
        as={kindToHeading[kind]}
      >
        <Text as="span">{formatName(kind, fullName, name)}</Text>
        {signature}
      </Text>
    </HStack>
  );
};

export default ApiNode;
