/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton, Text, Tooltip } from "@microbit/ui";
import { ComponentProps, useCallback } from "react";
import { RiEdit2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { HStack } from "styled-system/jsx";
import { useProject, useProjectActions } from "./project-hooks";

type HStackProps = ComponentProps<typeof HStack>;

interface ProjectNameEditableProps extends ComponentProps<typeof Text> {
  button?: "before" | "after";
  clickToEdit?: boolean;
  justifyContent?: HStackProps["justifyContent"];
  alignItems?: HStackProps["alignItems"];
}

/**
 * A control to enable editing of the project name.
 */
const ProjectNameEditable = ({
  button = "before",
  justifyContent,
  alignItems = "center",
  clickToEdit = false,
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
    >
      <IconButton
        size="md"
        css={{ fontSize: "xl", color: "brand.500" }}
        variant="ghost"
        onPress={handleClick}
        aria-label={intl.formatMessage({ id: "edit-project-name-action" })}
      >
        <RiEdit2Line />
      </IconButton>
    </Tooltip>
  );
  const text = (
    <Text
      key="text"
      cursor={clickToEdit ? "pointer" : undefined}
      onClick={clickToEdit ? handleClick : undefined}
      {...props}
    >
      {project.name}
    </Text>
  );
  return (
    <HStack gap="2.5" justifyContent={justifyContent} alignItems={alignItems}>
      {button === "before" ? [editButton, text] : [text, editButton]}
    </HStack>
  );
};

export default ProjectNameEditable;
