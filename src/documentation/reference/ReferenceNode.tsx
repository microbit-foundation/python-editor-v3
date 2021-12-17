/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, HStack, Text, VStack } from "@chakra-ui/layout";
import { Collapse } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import { firstParagraph } from "../../editor/codemirror/language-server/documentation";
import {
  ApiDocsBaseClass,
  ApiDocsEntry,
  ApiDocsFunctionParameter,
} from "../../language-server/apidocs";
import DocString from "../common/DocString";
import ShowMoreButton from "../common/ShowMoreButton";
import { allowWrapAtPeriods } from "../common/wrap";

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
  isShowingDetail?: boolean;
  onForward?: (itemId: string) => void;
}

const noop = () => {};

const ReferenceNode = ({
  isShowingDetail = false,
  docs,
  onForward = noop,
  mt,
  mb,
  ...others
}: ApiDocEntryNodeProps) => {
  const { kind, name, fullName, children, params, docString, baseClasses } =
    docs;
  const intl = useIntl();
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
  const [showMore, toggleShowMore] = useState(false);

  return (
    <Box
      id={fullName}
      wordBreak="break-word"
      mb={kindToSpacing[kind]}
      {...others}
      _hover={{
        "& button": {
          display: "flex",
        },
      }}
      fontSize={isShowingDetail ? "md" : "sm"}
    >
      <Box>
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
        <VStack alignItems="stretch" spacing={1}>
          {/* This needs working out properly */}
          {activeDocString && !showMore && (
            <DocString
              mt={isShowingDetail ? 5 : 2}
              fontWeight="normal"
              value={docStringFirstParagraph ?? ""}
            />
          )}
          <Collapse in={showMore}>
            <DocString
              mt={isShowingDetail ? 5 : 2}
              fontWeight="normal"
              value={docString ?? ""}
            />
          </Collapse>
        </VStack>
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
                  <Box mb={5} key={childKind}>
                    <Text fontWeight="lg" mb={2}>
                      {groupHeading(intl, kind, childKind)}
                    </Text>
                    {groupedChildren?.get(childKind as any)?.map((c) => (
                      <ReferenceNode
                        isShowingDetail={isShowingDetail}
                        key={c.id}
                        docs={c}
                        onForward={onForward}
                      />
                    ))}
                  </Box>
                )
            )}
          </Box>
        </Box>
      )}

      {kind !== "module" && kind !== "class" && hasDetail && (
        <HStack>
          <ShowMoreButton
            onClick={() => toggleShowMore(!showMore)}
            showmore={showMore}
          />
        </HStack>
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
