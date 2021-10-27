/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List } from "@chakra-ui/layout";
import { sortBy } from "lodash";
import { ApiDocsEntry, ApiDocsResponse } from "../language-server/apidocs";
import { useNavigationParameter } from "../navigation-hooks";
import ApiDocsEntryNode from "./ApiDocsEntryNode";
import DocString from "./DocString";
import Slide from "./ToolkitDocumentation/Slide";
import ToolkitBreadcrumbHeading from "./ToolkitDocumentation/ToolkitBreadcrumbHeading";
import ToolkitLevel from "./ToolkitDocumentation/ToolkitLevel";
import ToolkitListItem from "./ToolkitDocumentation/ToolkitListItem";
import ToolkitTopLevelHeading from "./ToolkitDocumentation/ToolkitTopLevelHeading";
import ToolkitTopLevelListItem from "./ToolkitDocumentation/ToolkitTopLevelListItem";

interface AdvancedToolkitProps {
  docs: ApiDocsResponse;
}

export const AdvancedToolkit = ({ docs }: AdvancedToolkitProps) => {
  const [advancedParam = "", setAdvancedParam] =
    useNavigationParameter("advanced");
  return (
    <ActiveTooklitLevel
      key={advancedParam}
      state={advancedParam}
      onNavigate={setAdvancedParam}
      docs={docs}
      direction={"forward"} // Hack!
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
  // microbit.compass.get_x
  // microbit.display.show-1

  const module = state
    ? Object.values(docs)
        .filter((module) => state.startsWith(module.fullName))
        .reduce(
          (acc: ApiDocsEntry | undefined, curr) =>
            // Longest match wins (e.g. microbit.compass)
            !acc || acc.fullName.length < curr.fullName.length ? curr : acc,
          undefined
        )
    : undefined;

  // It'd be cleaner to annotate the docs with these ids up-front.
  const [fullName, overloadCount] = state.split("-");
  const item = module
    ? (module.children ?? []).filter((i) => i.fullName === fullName)[
        overloadCount ? parseInt(overloadCount, 10) : 0
      ]
    : undefined;
  if (module && item) {
    return (
      <Slide direction={direction}>
        <ToolkitLevel
          heading={
            <ToolkitBreadcrumbHeading
              parent={module.fullName}
              grandparent={"Advanced"}
              title={item.name}
              onBack={() => onNavigate(module.fullName)}
            />
          }
        >
          <ApiDocsEntryNode docs={item} isShowingDetail p={5} />
        </ToolkitLevel>
      </Slide>
    );
  }
  if (module) {
    return (
      <Slide direction={direction}>
        <ToolkitLevel
          heading={
            <ToolkitBreadcrumbHeading
              parent={"Advanced"}
              title={module.name}
              onBack={() => onNavigate(undefined)}
            />
          }
        >
          <List flex="1 1 auto">
            {(module.children ?? []).map((item) => (
              <ToolkitListItem key={item.id}>
                <ApiDocsEntryNode
                  docs={item}
                  width="100%"
                  onForward={(fullName) => onNavigate(fullName)}
                />
              </ToolkitListItem>
            ))}
          </List>
        </ToolkitLevel>
      </Slide>
    );
  }
  return (
    <Slide direction={direction}>
      <ToolkitLevel
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
    </Slide>
  );
};
