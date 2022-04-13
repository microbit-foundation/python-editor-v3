/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import * as CSS from "csstype";
import {
  HStack,
  IconButton,
  ResponsiveValue,
  Text,
  TextProps,
  Tooltip,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { RiEdit2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { useDialogs } from "../common/use-dialogs";
import { useProject, useProjectActions } from "./project-hooks";
import ProjectNameQuestion from "./ProjectNameQuestion";

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
  const dialogs = useDialogs();
  const intl = useIntl();
  const handleEdit = useCallback(async () => {
    const name = await dialogs.input<string>({
      header: intl.formatMessage({ id: "name-project" }),
      Body: ProjectNameQuestion,
      initialValue: project.name,
      actionLabel: intl.formatMessage({ id: "confirm-action" }),
      customFocus: true,
      validate: (name: string) =>
        name.trim().length === 0
          ? intl.formatMessage({ id: "name-not-blank" })
          : undefined,
    });
    if (name) {
      actions.setProjectName(name);
    }
  }, [dialogs, actions, project, intl]);
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
        onClick={handleEdit}
        aria-label={intl.formatMessage({ id: "edit-project-name-action" })}
      />
    </Tooltip>
  );
  const text = (
    <Text
      key="text"
      cursor={clickToEdit ? "pointer" : undefined}
      onClick={clickToEdit ? handleEdit : undefined}
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
