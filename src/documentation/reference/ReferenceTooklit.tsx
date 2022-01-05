/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List } from "@chakra-ui/layout";
import sortBy from "lodash.sortby";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { ApiDocsResponse } from "../../language-server/apidocs";
import { Anchor, RouterParam, useRouterParam } from "../../router-hooks";
import DocString from "../common/DocString";
import { allowWrapAtPeriods } from "../common/wrap";
import { useAnimationDirection } from "../ToolkitDocumentation/toolkit-hooks";
import ToolkitBreadcrumbHeading from "../ToolkitDocumentation/ToolkitBreadcrumbHeading";
import ToolkitLevel from "../ToolkitDocumentation/ToolkitLevel";
import ToolkitListItem from "../ToolkitDocumentation/ToolkitListItem";
import ToolkitTopLevelHeading from "../ToolkitDocumentation/ToolkitTopLevelHeading";
import ToolkitTopLevelListItem from "../ToolkitDocumentation/ToolkitTopLevelListItem";
import { resolveModule } from "./apidocs-util";
import ReferenceNode from "./ReferenceNode";

interface ReferenceToolkitProps {
  docs: ApiDocsResponse;
}

export const ReferenceToolkit = ({ docs }: ReferenceToolkitProps) => {
  const [anchor, setAnchor] = useRouterParam(RouterParam.reference);
  const handleNavigate = useCallback(
    (id: string | undefined) => {
      setAnchor(id ? { id } : undefined);
    },
    [setAnchor]
  );
  const direction = useAnimationDirection(anchor);
  return (
    <ActiveTooklitLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      onNavigate={handleNavigate}
      docs={docs}
      direction={direction}
    />
  );
};

interface ActiveTooklitLevelProps {
  anchor: Anchor | undefined;
  docs: ApiDocsResponse;
  onNavigate: (state: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveTooklitLevel = ({
  anchor,
  onNavigate,
  docs,
  direction,
}: ActiveTooklitLevelProps) => {
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
          />
        }
      >
        <List flex="1 1 auto">
          {(module.children ?? []).map((child) => (
            <ToolkitListItem key={child.id}>
              <ReferenceNode docs={child} width="100%" anchor={anchor} />
            </ToolkitListItem>
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
            description={
              module.docString && <DocString value={module.docString} />
            }
            onForward={() => onNavigate(module.fullName)}
          />
        ))}
      </List>
    </ToolkitLevel>
  );
};
