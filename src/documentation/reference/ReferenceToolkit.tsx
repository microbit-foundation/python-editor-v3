/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List, ListItem, Divider } from "@chakra-ui/layout";
import sortBy from "lodash.sortby";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { firstParagraph } from "../../editor/codemirror/language-server/docstrings";
import { ApiDocsEntry, ApiDocsResponse } from "../../language-server/apidocs";
import { Anchor, RouterParam, useRouterParam } from "../../router-hooks";
import DocString from "../common/DocString";
import { allowWrapAtPeriods } from "../common/wrap";
import { useAnimationDirection } from "../explore/toolkit-hooks";
import ToolkitBreadcrumbHeading from "../explore/ToolkitBreadcrumbHeading";
import ToolkitLevel from "../explore/ToolkitLevel";
import ToolkitTopLevelHeading from "../explore/ToolkitTopLevelHeading";
import ToolkitTopLevelListItem from "../explore/ToolkitTopLevelListItem";
import { resolveModule } from "./apidocs-util";
import ReferenceNode from "./ReferenceNode";

interface ReferenceToolkitProps {
  docs: ApiDocsResponse;
}

export const ReferenceToolkit = ({ docs }: ReferenceToolkitProps) => {
  const [anchor, setAnchor] = useRouterParam(RouterParam.reference);
  const handleNavigate = useCallback(
    (id: string | undefined) => {
      setAnchor(id ? { id } : undefined, "toolkit-user");
    },
    [setAnchor]
  );
  const direction = useAnimationDirection(anchor);
  return (
    <ActiveToolkitLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      onNavigate={handleNavigate}
      docs={docs}
      direction={direction}
    />
  );
};

interface ActiveToolkitLevelProps {
  anchor: Anchor | undefined;
  docs: ApiDocsResponse;
  onNavigate: (state: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveToolkitLevel = ({
  anchor,
  onNavigate,
  docs,
  direction,
}: ActiveToolkitLevelProps) => {
  const intl = useIntl();
  const referenceString = intl.formatMessage({ id: "reference-tab" });
  const module = anchor ? resolveModule(docs, anchor.id) : undefined;
  if (module) {
    return (
      <ToolkitLevel
        direction={direction}
        heading={
          <ToolkitBreadcrumbHeading
            parent={referenceString}
            title={module.name}
            onBack={() => onNavigate(undefined)}
            subtitle={<ShortModuleDescription value={module} />}
          />
        }
      >
        <List flex="1 1 auto">
          {(module.children ?? []).map((child) => (
            <ListItem key={child.id}>
              <ReferenceNode docs={child} width="100%" anchor={anchor} />
              <Divider />
            </ListItem>
          ))}
        </List>
      </ToolkitLevel>
    );
  }
  return (
    <ToolkitLevel
      direction={direction}
      heading={
        <ToolkitTopLevelHeading
          name={referenceString}
          description={intl.formatMessage({ id: "reference-description" })}
        />
      }
    >
      <List flex="1 1 auto" m={3}>
        {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
          <ToolkitTopLevelListItem
            key={module.id}
            name={allowWrapAtPeriods(module.fullName)}
            description={<ShortModuleDescription value={module} />}
            onForward={() => onNavigate(module.id)}
          />
        ))}
      </List>
    </ToolkitLevel>
  );
};

const ShortModuleDescription = ({ value }: { value: ApiDocsEntry }) =>
  value.docString ? (
    <DocString value={firstParagraph(value.docString)} />
  ) : null;
