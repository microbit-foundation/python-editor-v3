/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton, Text, Tooltip } from "@microbit/ui";
import { ComponentProps, useCallback } from "react";
import { RiEdit2Line, RiMoreLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { HStack } from "styled-system/jsx";
import { useProject, useProjectActions } from "./project-hooks";

type HStackProps = ComponentProps<typeof HStack>;

interface ProjectNameEditableProps extends ComponentProps<typeof Text> {
  button?: "before" | "after";
  clickToEdit?: boolean;
  justifyContent?: HStackProps["justifyContent"];
  alignItems?: HStackProps["alignItems"];
  /**
   * How it gives way when space is short: the name truncates with an
   * ellipsis, or collapses to a button that still opens the rename.
   */
  squeeze?: "none" | "truncate" | "collapse";
}

/**
 * A control to enable editing of the project name.
 */
const ProjectNameEditable = ({
  button = "before",
  justifyContent,
  alignItems = "center",
  clickToEdit = false,
  squeeze = "none",
  ...props
}: ProjectNameEditableProps) => {
  const project = useProject();
  const actions = useProjectActions();
  const intl = useIntl();
  const handleClick = useCallback(() => {
    actions.editProjectName();
  }, [actions]);
  const editButton = (
    <Tooltip
      hasArrow
      label={intl.formatMessage({ id: "edit-name-project-hover" })}
      placement="top start"
      key="button"
      // The button is a pencil and nothing else, so the tooltip is its only
      // visible explanation: no warmup.
      delay={0}
    >
      <IconButton
        size="md"
        css={{ fontSize: "xl", color: "brand.500" }}
        variant="ghost"
        onPress={handleClick}
        aria-label={intl.formatMessage({ id: "edit-project-name-action" })}
      >
        {squeeze === "collapse" ? <RiMoreLine /> : <RiEdit2Line />}
      </IconButton>
    </Tooltip>
  );
  if (squeeze === "collapse") {
    return editButton;
  }
  const text = (
    <Text
      key="text"
      cursor={clickToEdit ? "pointer" : undefined}
      onClick={clickToEdit ? handleClick : undefined}
      whiteSpace="nowrap"
      // Literals so Panda can extract both.
      overflow={squeeze === "truncate" ? "hidden" : "visible"}
      textOverflow={squeeze === "truncate" ? "ellipsis" : "clip"}
      minW={squeeze === "truncate" ? "8ch" : "auto"}
      {...props}
    >
      {project.name}
    </Text>
  );
  return (
    <HStack
      gap="2.5"
      justifyContent={justifyContent}
      alignItems={alignItems}
      flexShrink={squeeze === "truncate" ? 1 : 0}
    >
      {button === "before" ? [editButton, text] : [text, editButton]}
    </HStack>
  );
};

export default ProjectNameEditable;
