/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, HStack, Text, VStack } from "@chakra-ui/layout";
import {
  Collapse,
  useDisclosure,
  usePrefersReducedMotion,
  usePrevious,
} from "@chakra-ui/react";
import {
  default as React,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import {
  debug as dndDebug,
  setDraggedCode,
  setToolkitType,
} from "../../editor/codemirror/dnd";
import { RequiredImport } from "../../editor/codemirror/edits";
import { splitDocString } from "../../editor/codemirror/language-server/documentation";
import { flags } from "../../flags";
import {
  ApiDocsBaseClass,
  ApiDocsEntry,
  ApiDocsFunctionParameter,
} from "../../language-server/apidocs";
import { useLogging } from "../../logging/logging-hooks";
import { Anchor } from "../../router-hooks";
import { useScrollablePanelAncestor } from "../../workbench/ScrollablePanel";
import DocString from "../common/DocString";
import DragHandle from "../common/DragHandle";
import ShowMoreButton from "../common/ShowMoreButton";
import { allowWrapAtPeriods } from "../common/wrap";

export const referenceToolkitType = "reference";

interface CodeWithImports {
  code: string;
  requiredImport: RequiredImport;
}

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

const classToInstanceMap: Record<string, string> = {
  Button: "button_a",
  MicroBitDigitalPin: "pin0",
  MicroBitTouchPin: "pin0",
  MicroBitAnalogDigitalPin: "pin0",
  Image: "Image.HEART",
};

interface ApiDocEntryNodeProps extends BoxProps {
  docs: ApiDocsEntry;
  anchor?: Anchor;
}

const ReferenceNode = ({ anchor, docs, ...others }: ApiDocEntryNodeProps) => {
  const { kind, fullName } = docs;
  const disclosure = useDisclosure();

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
      disclosure.onOpen();
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
    disclosure,
    fullName,
  ]);

  return (
    <Box
      ref={ref}
      id={fullName}
      wordBreak="break-word"
      mb={kindToSpacing[kind]}
      _hover={{
        "& button": {
          display: "flex",
        },
      }}
      fontSize="sm"
      {...others}
    >
      <ReferenceNodeSelf
        docs={docs}
        showMore={disclosure.isOpen}
        onToggleShowMore={disclosure.onToggle}
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

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      dndDebug("dragstart");
      event.dataTransfer.dropEffect = "copy";

      const parts = fullName.split(".");
      const isMicrobit = parts[0] === "microbit";
      let use = isMicrobit ? parts.slice(1) : parts;
      use = use.map((p) => classToInstanceMap[p] ?? p);
      const requiredImport = isMicrobit
        ? { module: "microbit", name: "*" }
        : { module: parts[0] };
      const codeWithImports: CodeWithImports = {
        code: use.join(".") + (kind === "function" ? "()" : ""),
        requiredImport,
      };

      const requiredImportCode = requiredImport.name
        ? `from ${requiredImport.module} import ${requiredImport.name}`
        : `import ${requiredImport.module}`;
      const changes = `${requiredImportCode} ${codeWithImports.code}`;

      setDraggedCode(changes);
      setToolkitType(referenceToolkitType);
      event.dataTransfer.setData(pythonSnippetMediaType, changes);
    },
    [fullName, kind]
  );

  const handleDragEnd = useCallback((event: React.DragEvent) => {
    dndDebug("dragend");
    setDraggedCode(undefined);
    setToolkitType(undefined);
  }, []);

  return (
    <VStack alignItems="stretch" spacing={3}>
      <HStack
        alignSelf="flex-start"
        draggable={kind !== "class" ? flags.dnd : false}
        spacing={0}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        boxShadow="rgba(0, 0, 0, 0.18) 0px 2px 6px;"
        borderRadius="lg"
        display="inline-flex"
        overflow="hidden"
      >
        {kind !== "class" && flags.dnd && (
          <DragHandle
            borderTopLeftRadius="lg"
            borderBottomLeftRadius="lg"
            p={1}
            alignSelf="stretch"
          />
        )}
        <Text
          backgroundColor="#f7f5f2"
          p={[5, 2]}
          pl={flags.dnd ? 2 : 5}
          fontFamily="code"
          fontSize={kindToFontSize[kind] || "md"}
          as={kindToHeading[kind]}
        >
          <Text as="span">{formatName(kind, fullName, name)}</Text>
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
