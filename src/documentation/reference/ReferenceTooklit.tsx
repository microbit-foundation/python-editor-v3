/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { usePrevious } from "@chakra-ui/hooks";
import { List } from "@chakra-ui/layout";
import sortBy from "lodash.sortby";
import { useIntl } from "react-intl";
import { ApiDocsResponse } from "../../language-server/apidocs";
import { useRouterParam } from "../../router-hooks";
import DocString from "../common/DocString";
import { allowWrapAtPeriods } from "../common/wrap";
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
  const [urlParam = "", setUrlParam] = useRouterParam("reference");
  const previousParam = usePrevious(urlParam) ?? "";
  const direction =
    previousParam.length === 0 && urlParam.length > 0
      ? "forward"
      : previousParam.length > 0 && urlParam.length === 0
      ? "back"
      : "none";
  return (
    <ActiveTooklitLevel
      key={urlParam.length > 0 ? 0 : 1}
      state={urlParam}
      onNavigate={setUrlParam}
      docs={docs}
      direction={direction}
    />
  );
};

interface ActiveTooklitLevelProps {
  state: string;
  docs: ApiDocsResponse;
  onNavigate: (state: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveTooklitLevel = ({
  state,
  onNavigate,
  docs,
  direction,
}: ActiveTooklitLevelProps) => {
  const intl = useIntl();
  const referenceString = intl.formatMessage({ id: "reference-tab" });
  const module = resolveModule(docs, state);
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
              <ReferenceNode docs={child} width="100%" activeFullName={state} />
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
