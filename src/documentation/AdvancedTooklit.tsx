/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { usePrevious } from "@chakra-ui/hooks";
import { List } from "@chakra-ui/layout";
import { sortBy } from "lodash";
import { ApiDocsResponse } from "../language-server/apidocs";
import { useRouterParam } from "../router-hooks";
import { resolveDottedName, resolveModule } from "./apidocs-util";
import ApiDocsEntryNode from "./ApiDocsEntryNode";
import DocString from "./DocString";
import ToolkitBreadcrumbHeading from "./ToolkitDocumentation/ToolkitBreadcrumbHeading";
import ToolkitLevel from "./ToolkitDocumentation/ToolkitLevel";
import ToolkitListItem from "./ToolkitDocumentation/ToolkitListItem";
import ToolkitTopLevelHeading from "./ToolkitDocumentation/ToolkitTopLevelHeading";
import ToolkitTopLevelListItem from "./ToolkitDocumentation/ToolkitTopLevelListItem";

interface AdvancedToolkitProps {
  docs: ApiDocsResponse;
}

export const AdvancedToolkit = ({ docs }: AdvancedToolkitProps) => {
  const [advancedParam = "", setAdvancedParam] = useRouterParam("advanced");
  // Only transitions are up or down levels so can just compare length.
  const previousParam = usePrevious(advancedParam) ?? "";
  const direction =
    previousParam.length === advancedParam.length
      ? "none"
      : previousParam.length < advancedParam.length
      ? "forward"
      : "back";
  return (
    <ActiveTooklitLevel
      key={advancedParam}
      state={advancedParam}
      onNavigate={setAdvancedParam}
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
  const item = resolveDottedName(docs, state);
  if (item) {
    if (item.kind === "module") {
      return (
        <ToolkitLevel
          direction={direction}
          heading={
            <ToolkitBreadcrumbHeading
              parent={"Advanced"}
              title={item.name}
              onBack={() => onNavigate(undefined)}
            />
          }
        >
          <List flex="1 1 auto">
            {(item.children ?? []).map((child) => (
              <ToolkitListItem key={child.id}>
                <ApiDocsEntryNode
                  docs={child}
                  width="100%"
                  // This isn't coping with overloads.
                  onForward={onNavigate}
                />
              </ToolkitListItem>
            ))}
          </List>
        </ToolkitLevel>
      );
    } else {
      const moduleName = resolveModule(docs, item.fullName)!.fullName;
      return (
        <ToolkitLevel
          direction={direction}
          heading={
            <ToolkitBreadcrumbHeading
              parent={moduleName}
              grandparent={"Advanced"}
              title={item.name}
              onBack={() => onNavigate(moduleName)}
            />
          }
        >
          <ApiDocsEntryNode docs={item} isShowingDetail p={5} />
        </ToolkitLevel>
      );
    }
  }
  return (
    <ToolkitLevel
      direction={direction}
      heading={
        <ToolkitTopLevelHeading
          name="Advanced"
          description="Reference documentation for micro:bit MicroPython"
        />
      }
    >
      <List flex="1 1 auto" m={3}>
        {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
          <ToolkitTopLevelListItem
            key={module.id}
            name={module.fullName}
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
