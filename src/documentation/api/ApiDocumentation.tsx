/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Divider, List, ListItem } from "@chakra-ui/layout";
import { Link } from "@chakra-ui/react";
import sortBy from "lodash.sortby";
import { ReactNode, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import AreaHeading from "../../common/AreaHeading";
import { docStyles } from "../../common/documentation-styles";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import { splitDocString } from "../../editor/codemirror/language-server/docstrings";
import { ApiDocsEntry, ApiDocsResponse } from "../../language-server/apidocs";
import { Anchor, useRouterTabSlug, useRouterState } from "../../router-hooks";
import DocString from "../common/DocString";
import { useAnimationDirection } from "../common/documentation-animation-hooks";
import DocumentationBreadcrumbHeading from "../common/DocumentationBreadcrumbHeading";
import DocumentationTopLevelItem from "../common/DocumentationTopLevelItem";
import { allowWrapAtPeriods } from "../common/wrap";
import { resolveModule } from "./apidocs-util";
import ApiNode from "./ApiNode";

interface ApiDocumentationProps {
  docs: ApiDocsResponse;
}

export const ApiDocumentation = ({ docs }: ApiDocumentationProps) => {
  const [anchor, setAnchor] = useRouterTabSlug("api");
  const handleNavigate = useCallback(
    (id: string | undefined) => {
      setAnchor(id ? { id } : undefined, "documentation-user");
    },
    [setAnchor]
  );
  const direction = useAnimationDirection(anchor);
  return (
    <ActiveLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      onNavigate={handleNavigate}
      docs={docs}
      direction={direction}
    />
  );
};

interface ActiveLevelProps {
  anchor: Anchor | undefined;
  docs: ApiDocsResponse;
  onNavigate: (state: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveLevel = ({
  anchor,
  onNavigate,
  docs,
  direction,
}: ActiveLevelProps) => {
  const intl = useIntl();
  const apiString = intl.formatMessage({ id: "api-tab" });
  const module = anchor ? resolveModule(docs, anchor.id) : undefined;
  const [, setParams] = useRouterState();
  const handleReferenceLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setParams({ tab: "reference" });
    },
    [setParams]
  );
  if (module) {
    return (
      <HeadedScrollablePanel
        direction={direction}
        heading={
          <DocumentationBreadcrumbHeading
            parent={apiString}
            title={module.name}
            onBack={() => onNavigate(undefined)}
            subtitle={<ShortModuleDescription value={module} as="span" />}
          />
        }
      >
        <List flex="1 1 auto">
          {(module.children ?? []).map((child) => (
            <ListItem key={child.id}>
              <ApiNode
                docs={child}
                width="100%"
                anchor={anchor}
                sx={{
                  ...docStyles,
                }}
              />
              <Divider />
            </ListItem>
          ))}
        </List>
      </HeadedScrollablePanel>
    );
  }
  return (
    <HeadedScrollablePanel
      direction={direction}
      heading={
        <AreaHeading
          name={apiString}
          description={
            <FormattedMessage
              id="api-description"
              values={{
                link: (chunks: ReactNode) => (
                  <Link color="brand.500" onClick={handleReferenceLink} href="">
                    {chunks}
                  </Link>
                ),
              }}
            />
          }
        />
      }
    >
      <List flex="1 1 auto" m={3}>
        {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
          <DocumentationTopLevelItem
            key={module.id}
            name={allowWrapAtPeriods(module.fullName)}
            description={<ShortModuleDescription value={module} />}
            onForward={() => onNavigate(module.id)}
            type="api"
          />
        ))}
      </List>
    </HeadedScrollablePanel>
  );
};

interface ShortModuleDescriptionProps extends BoxProps {
  value: ApiDocsEntry;
}

const ShortModuleDescription = ({
  value,
  ...props
}: ShortModuleDescriptionProps) =>
  value.docString ? (
    <DocString
      value={splitDocString(value.docString).summary.trim().replace(/\.$/, "")}
      {...props}
    />
  ) : null;
