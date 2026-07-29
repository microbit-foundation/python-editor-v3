/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useMediaQuery } from "@microbit/ui";
import React, { ForwardedRef } from "react";
import { useIntl } from "react-intl";
import { Box, Flex, styled } from "styled-system/jsx";
import { token } from "styled-system/tokens";
import { widthXl } from "../common/media-queries";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { topBarHeight } from "../deployment/misc";
import ZoomControls from "../editor/ZoomControls";
import ProjectNameEditable from "../project/ProjectNameEditable";
import { WorkbenchSelection } from "../workbench/use-selection";
import ActiveFileInfo from "./ActiveFileInfo";
import EditorContainer from "./EditorContainer";
import UndoRedoControls from "./UndoRedoControls";

interface EditorAreaProps {
  selection: WorkbenchSelection;
  onSelectedFileChanged: (filename: string) => void;
  simulatorShown: boolean;
  onSimulatorExpand: () => void;
}

/**
 * Wrapper for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorArea = React.forwardRef(
  (
    {
      selection,
      onSelectedFileChanged,
      simulatorShown,
      onSimulatorExpand,
    }: EditorAreaProps,
    simulatorButtonRef: ForwardedRef<HTMLButtonElement>
  ) => {
    const intl = useIntl();
    const isWideScreen = useMediaQuery(widthXl);
    return (
      <Flex height="100%" flexDirection="column" backgroundColor="gray.10">
        <styled.section
          aria-label={intl.formatMessage({ id: "project-header" })}
          display="flex"
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          pl={isWideScreen ? "3rem" : "2rem"}
          py="2"
          // Three-way padding + imported height constant: runtime values.
          style={{
            paddingRight: !simulatorShown
              ? 0
              : token(isWideScreen ? "spacing.10" : "spacing.5"),
            height: topBarHeight,
          }}
        >
          <ProjectNameEditable
            color="gray.700"
            opacity="80%"
            fontSize="xl"
            data-testid="project-name"
            clickToEdit
          />
          <ActiveFileInfo
            filename={selection.file}
            onSelectedFileChanged={onSelectedFileChanged}
          />
          <Flex alignItems="center">
            <ZoomControls css={{ display: ["none", "none", "none", "flex"] }} />
            {!simulatorShown && (
              <HideSplitViewButton
                aria-label={intl.formatMessage({ id: "simulator-expand" })}
                onClick={onSimulatorExpand}
                splitViewShown={simulatorShown}
                direction="expandLeft"
                text={intl.formatMessage({ id: "simulator-title" })}
                css={{ ml: "5", boxShadow: "none" }}
                ref={simulatorButtonRef}
              />
            )}
          </Flex>
        </styled.section>
        {/* Just for the line */}
        <Box
          ml={isWideScreen ? "6rem" : "5rem"}
          mr={isWideScreen ? "2.5rem" : "1.25rem"}
          mb="5"
          width={isWideScreen ? "calc(100% - 8.5rem)" : "calc(100% - 6.25rem)"}
          borderBottomWidth="2px"
          borderBottomStyle="solid"
          borderColor="gray.200"
        />
        <Box position="relative" flex="1 1 auto" height="0">
          <UndoRedoControls
            css={{
              display: ["none", "none", "none", "flex"],
              zIndex: 1,
              top: "6",
              right: isWideScreen ? "10" : "5",
              position: "absolute",
            }}
          />
          <EditorContainer selection={selection} />
        </Box>
      </Flex>
    );
  }
);

export default EditorArea;
