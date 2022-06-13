/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  HStack,
  IconButton,
  ResponsiveValue,
  Text,
  TextProps,
  Tooltip,
} from "@chakra-ui/react";
import * as CSS from "csstype";
import { useCallback } from "react";
import { RiEdit2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { useProject, useProjectActions } from "./project-hooks";

interface ProjectNameEditableProps extends TextProps {
  button?: "before" | "after";
  clickToEdit?: boolean;
  justifyContent?: ResponsiveValue<CSS.Property.JustifyContent>;
  alignItems?: ResponsiveValue<CSS.Property.AlignItems>;
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
      placement="top-start"
      key="button"
    >
      <IconButton
        size="md"
        icon={<RiEdit2Line />}
        fontSize="xl"
        color="brand.500"
        variant="ghost"
        onClick={handleClick}
        aria-label={intl.formatMessage({ id: "edit-project-name-action" })}
      />
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
    <HStack
      spacing={2.5}
      justifyContent={justifyContent}
      alignItems={alignItems}
    >
      {button === "before" ? [editButton, text] : [text, editButton]}
    </HStack>
  );
};

export default ProjectNameEditable;
