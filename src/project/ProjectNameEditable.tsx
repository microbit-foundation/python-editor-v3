/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { HStack, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiEdit2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { useDialogs } from "../common/use-dialogs";
import { useProject, useProjectActions } from "./project-hooks";
import ProjectNameQuestion from "./ProjectNameQuestion";
import ZoomControls from "../editor/ZoomControls";

/**
 * A control to enable editing of the project name.
 */
const ProjectNameEditable = () => {
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
  return (
    <HStack spacing={2.5}>
      <Tooltip
        hasArrow
        label={intl.formatMessage({ id: "edit-name-project-hover" })}
        placement="top-start"
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
      <Text
        color="gray.700"
        opacity="80%"
        fontSize="xl"
        cursor="pointer"
        onClick={handleEdit}
        data-testid="project-name"
      >
        {project.name}
      </Text>
      <ZoomControls
        display={["none", "none", "none", "flex"]}
        zIndex="1"
        right={10}
        position="absolute"
      />
    </HStack>
  );
};

export default ProjectNameEditable;
