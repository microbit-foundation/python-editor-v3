/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, HStack, Text, VStack } from "@chakra-ui/layout";
import {
  Collapse,
  usePrefersReducedMotion,
  usePrevious,
} from "@chakra-ui/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import { splitDocString } from "../../editor/codemirror/language-server/documentation";
import {
  ApiDocsBaseClass,
  ApiDocsEntry,
  ApiDocsFunctionParameter,
} from "../../language-server/apidocs";
import { useLogging } from "../../logging/logging-hooks";
import { Anchor } from "../../router-hooks";
import { useScrollablePanelAncestor } from "../../workbench/ScrollablePanel";
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
  anchor?: Anchor;
}

const ReferenceNode = ({
  anchor,
  docs,
  mt,
  mb,
  ...others
}: ApiDocEntryNodeProps) => {
  const { kind, fullName } = docs;
  const [showDetails, setShowDetails] = useState(false);
  const handleShowMore = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails, setShowDetails]);

  const active = anchor?.id === fullName;
  // If we're newly active then scroll to us and set a fading background highlight (todo!)
  const ref = useRef<HTMLDivElement>(null);
  const previousAnchor = usePrevious(anchor);
  const scrollable = useScrollablePanelAncestor();
  const prefersReducedMotion = usePrefersReducedMotion();
  const logging = useLogging();
  useEffect(() => {
    if (previousAnchor !== anchor && active) {
      logging.log("Activating " + fullName);
      if (!showDetails) {
        setShowDetails(true);
      }
      // Delay until after the opening animation so the full container height is known for the scroll.
      window.setTimeout(() => {
        if (ref.current && scrollable.current) {
          scrollable.current.scrollTo({
            // Fudge to account for the fixed header and to leave a small gap.
            top: ref.current.offsetTop - 112 - 25,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }
      }, 150);
    }
  }, [
    anchor,
    scrollable,
    active,
    previousAnchor,
    prefersReducedMotion,
    logging,
    showDetails,
    setShowDetails,
    fullName,
  ]);

  return (
    <Box
      ref={ref}
      id={fullName}
      wordBreak="break-word"
      mb={kindToSpacing[kind]}
      {...others}
      _hover={{
        "& button": {
          display: "flex",
        },
      }}
      fontSize="sm"
    >
      <ReferenceNodeSelf
        docs={docs}
        showMore={showDetails}
        onToggleShowMore={handleShowMore}
      />
      <ReferenceNodeChildren docs={docs} anchor={anchor} />
    </Box>
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
