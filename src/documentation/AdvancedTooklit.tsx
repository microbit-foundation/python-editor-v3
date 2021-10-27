/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { usePrevious } from "@chakra-ui/hooks";
import { List } from "@chakra-ui/layout";
import { sortBy } from "lodash";
import { useState } from "react";
import { ApiDocsResponse } from "../language-server/apidocs";
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

interface AdvancedDocsNavigationState {
  moduleId?: string;
  itemId?: string;
}

export const AdvancedToolkit = ({ docs }: AdvancedToolkitProps) => {
  const [state, setState] = useState<AdvancedDocsNavigationState>({});
  const previous = usePrevious(state);
  const currentLevel = [state.itemId, state.moduleId].filter(Boolean).length;
  const previousLevel = previous
    ? [previous.itemId, previous.moduleId].filter(Boolean).length
    : 0;
  const direction =
    currentLevel === previousLevel
      ? "none"
      : currentLevel > previousLevel
      ? "forward"
      : "back";
  return (
    <ActiveTooklitLevel
      key={state.moduleId + "-" + state.itemId}
      state={state}
      onNavigate={setState}
      docs={docs}
      direction={direction}
    />
  );
};

interface ActiveTooklitLevelProps {
  state: AdvancedDocsNavigationState;
  docs: ApiDocsResponse;
  onNavigate: React.Dispatch<React.SetStateAction<AdvancedDocsNavigationState>>;
  direction: "forward" | "back" | "none";
}

const ActiveTooklitLevel = ({
  state,
  onNavigate,
  docs,
  direction,
}: ActiveTooklitLevelProps) => {
  const module = state.moduleId
    ? Object.values(docs).find((module) => module.id === state.moduleId)
    : undefined;
  if (module && state.itemId) {
    const item = (module.children ?? []).find((i) => i.id === state.itemId);
    if (item) {
      return (
        <Slide direction={direction}>
          <ToolkitLevel
            heading={
              <ToolkitBreadcrumbHeading
                parent={module.fullName}
                grandparent={"Advanced"}
                title={item.name}
                onBack={() =>
                  onNavigate({
                    moduleId: module.id,
                  })
                }
              />
            }
          >
            <ApiDocsEntryNode docs={item} isShowingDetail p={5} />
          </ToolkitLevel>
        </Slide>
      );
    }
  } else if (module) {
    return (
      <Slide direction={direction}>
        <ToolkitLevel
          heading={
            <ToolkitBreadcrumbHeading
              parent={"Advanced"}
              title={module.name}
              onBack={() => onNavigate({})}
            />
          }
        >
          <List flex="1 1 auto">
            {(module.children ?? []).map((item) => (
              <ToolkitListItem key={item.id}>
                <ApiDocsEntryNode
                  docs={item}
                  width="100%"
                  onForward={(itemId) =>
                    onNavigate({
                      moduleId: module.id,
                      // Potentially more nested than item.fullName, e.g. a method on a class.
                      itemId,
                    })
                  }
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
              onForward={() =>
                onNavigate({
                  moduleId: module.id,
                })
              }
            />
          ))}
        </List>
      </ToolkitLevel>
    </Slide>
  );
};
