/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List, ListItem, Divider, BoxProps } from "@chakra-ui/layout";
import sortBy from "lodash.sortby";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { firstParagraph } from "../../editor/codemirror/language-server/docstrings";
import { ApiDocsEntry, ApiDocsResponse } from "../../language-server/apidocs";
import { Anchor, RouterParam, useRouterParam } from "../../router-hooks";
import DocString from "../common/DocString";
import { allowWrapAtPeriods } from "../common/wrap";
import { useAnimationDirection } from "../common/documentation-animation-hooks";
import DocumentationBreadcrumbHeading from "../common/DocumentationBreadcrumbHeading";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import AreaHeading from "../../common/AreaHeading";
import DocumentationTopLevelItem from "../common/DocumentationTopLevelItem";
import { resolveModule } from "./apidocs-util";
import ApiNode from "./ApiNode";
import { docStyles } from "../../common/documentation-styles";

interface ApiDocumentationProps {
  docs: ApiDocsResponse;
}

export const ApiDocumentation = ({ docs }: ApiDocumentationProps) => {
  const [anchor, setAnchor] = useRouterParam(RouterParam.api);
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
          description={intl.formatMessage({ id: "api-description" })}
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
      value={firstParagraph(value.docString).trim().replace(/\.$/, "")}
      {...props}
    />
  ) : null;
