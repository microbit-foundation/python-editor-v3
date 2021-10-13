import { Button, IconButton } from "@chakra-ui/button";
import { useClipboard } from "@chakra-ui/hooks";
import { Box, BoxProps, HStack, Text, VStack } from "@chakra-ui/layout";
import { HTMLChakraProps } from "@chakra-ui/system";
import { Tooltip } from "@chakra-ui/tooltip";
import React, { useMemo, useState } from "react";
import { RiFileCopy2Line } from "react-icons/ri";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { firstParagraph } from "../editor/codemirror/language-server/documentation";
import {
  ApiDocsBaseClass,
  ApiDocsEntry,
  ApiDocsFunctionParameter,
} from "../language-server/apidocs";
import DocString from "./DocString";

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
  heading?: boolean;
}

const ApiDocsEntryNode = ({
  docs,
  heading = true,
  mt,
  mb,
  ...others
}: ApiDocEntryNodeProps) => {
  const { kind, name, fullName, children, params, docString, baseClasses } =
    docs;
  const intl = useIntl();
  const variableOrFunction = kind === "variable" || kind === "function";
  const [isShowingDetail, setShowingDetail] = useState(false);
  const groupedChildren = useMemo(() => {
    const filteredChildren = filterChildren(children);
    return filteredChildren
      ? groupBy(filteredChildren, (c) => c.kind)
      : undefined;
  }, [children]);
  const docStringFirstParagraph = docString
    ? firstParagraph(docString)
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
      p={variableOrFunction ? 2 : undefined}
      backgroundColor={variableOrFunction ? "gray.10" : undefined}
      borderRadius="md"
      {...others}
      _hover={{
        "& button": {
          display: "flex",
        },
      }}
    >
      {heading && (
        <Box>
          <HStack>
            <Text fontSize={kindToFontSize[kind]} as={kindToHeading[kind]}>
              <Text as="span" fontWeight="semibold">
                {formatName(kind, fullName, name)}
              </Text>
              {signature}
            </Text>
            {variableOrFunction && <CopyButton docs={docs} display="none" />}
          </HStack>
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
                    aria-label={intl.formatMessage(
                      {
                        id: isShowingDetail ? "show-less-for" : "show-more-for",
                      },
                      { item: name }
                    )}
                  >
                    <FormattedMessage
                      id={isShowingDetail ? "show-less" : "show-more"}
                    />
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
                      {groupHeading(intl, kind, childKind)}
                    </Text>
                    {groupedChildren?.get(childKind as any)?.map((c) => (
                      <ApiDocsEntryNode key={c.id} docs={c} />
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
  // Add zero width spaces to allow breaking
  return kind === "module" ? fullName.replace(/\./g, "\u200b.\u200b") : name;
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

interface CopyButtonProps extends HTMLChakraProps<"button"> {
  docs: ApiDocsEntry;
}

const CopyButton = ({ docs }: CopyButtonProps) => {
  const { hasCopied, onCopy } = useClipboard(clipboardText(docs));
  const intl = useIntl();
  const label = intl.formatMessage({ id: hasCopied ? "copied" : "copy" });
  return (
    <Tooltip hasArrow placement="right" label="Copy to clipboard">
      <IconButton
        size="sm"
        variant="ghost"
        onClick={onCopy}
        icon={<RiFileCopy2Line />}
        aria-label={label}
      />
    </Tooltip>
  );
};

const clipboardText = (docs: ApiDocsEntry) => {
  const parts = docs.fullName.split(".");
  const isMicrobit = parts[0] === "microbit";
  let use = isMicrobit ? parts.slice(1) : parts;
  return use.join(".") + (docs.kind === "function" ? "()" : "");
};

export default ApiDocsEntryNode;
