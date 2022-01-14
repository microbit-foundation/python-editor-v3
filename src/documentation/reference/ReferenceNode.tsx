/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, HStack, Text, VStack, Stack } from "@chakra-ui/layout";
import { Collapse, useDisclosure } from "@chakra-ui/react";
import { useMemo } from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import { splitDocString } from "../../editor/codemirror/language-server/documentation";
import {
  ApiDocsBaseClass,
  ApiDocsEntry,
  ApiDocsFunctionParameter,
} from "../../language-server/apidocs";
import { Anchor } from "../../router-hooks";
import DocString from "../common/DocString";
import ShowMoreButton from "../common/ShowMoreButton";
import { allowWrapAtPeriods } from "../common/wrap";
import Highlight from "../ToolkitDocumentation/Highlight";

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

interface ApiDocEntryNodeProps extends BoxProps {
  docs: ApiDocsEntry;
  anchor?: Anchor;
}

const ReferenceNode = ({ anchor, docs, ...props }: ApiDocEntryNodeProps) => {
  const { fullName } = docs;
  const active = anchor?.id === fullName;
  const disclosure = useDisclosure();
  return (
    <Highlight
      anchor={anchor}
      active={active}
      entryName={fullName}
      disclosure={disclosure}
    >
      <Stack
        id={fullName}
        wordBreak="break-word"
        _hover={{
          "& button": {
            display: "flex",
          },
        }}
        fontSize="sm"
        spacing={3}
        p={5}
        pr={3}
        mt={1}
        mb={1}
        {...props}
      >
        <ReferenceNodeSelf
          docs={docs}
          showMore={disclosure.isOpen}
          onToggleShowMore={disclosure.onToggle}
        />
        <ReferenceNodeChildren docs={docs} anchor={anchor} />
      </Stack>
    </Highlight>
  );
};

interface ReferenceNodeSelfProps {
  docs: ApiDocsEntry;
  showMore: boolean;
  onToggleShowMore: () => void;
}

/**
 * The current node's details, not its children.
 */
const ReferenceNodeSelf = ({
  docs,
  showMore,
  onToggleShowMore,
}: ReferenceNodeSelfProps) => {
  const { fullName, name, kind, params, baseClasses, docString } = docs;
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
    <VStack alignItems="stretch" spacing={3}>
      <HStack>
        <Text
          fontFamily="code"
          fontSize={kindToFontSize[kind] || "md"}
          as={kindToHeading[kind]}
        >
          <Text as="span" fontWeight="semibold">
            {formatName(kind, fullName, name)}
          </Text>
          {signature}
        </Text>
      </HStack>
      {baseClasses && baseClasses.length > 0 && (
        <BaseClasses value={baseClasses} />
      )}
      <DocString fontWeight="normal" value={docStringFirstParagraph ?? ""} />
      {(hasDocStringDetail || hasSignatureDetail) && (
        <>
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
          <ShowMoreButton onClick={onToggleShowMore} isOpen={showMore} />
        </>
      )}
    </VStack>
  );
};

interface ReferenceNodeChildrenProps {
  anchor: Anchor | undefined;
  docs: ApiDocsEntry;
}

const ReferenceNodeChildren = ({
  docs,
  anchor,
}: ReferenceNodeChildrenProps) => {
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
                  <ReferenceNode anchor={anchor} key={c.id} docs={c} />
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

export default ReferenceNode;
