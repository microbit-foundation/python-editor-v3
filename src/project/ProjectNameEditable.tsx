import { HStack, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiEdit2Line } from "react-icons/ri";
import { useDialogs } from "../common/use-dialogs";
import { useProject, useProjectActions } from "./project-hooks";
import ProjectNameQuestion from "./ProjectNameQuestion";

/**
 * A control to enable editing of the project name.
 */
const ProjectNameEditable = () => {
  const project = useProject();
  const actions = useProjectActions();
  const dialogs = useDialogs();
  const handleEdit = useCallback(async () => {
    const name = await dialogs.input<string>({
      header: "Name your project",
      Body: ProjectNameQuestion,
      initialValue: project.name,
      actionLabel: "Confirm",
      customFocus: true,
      validate: (name: string) =>
        name.trim().length === 0
          ? "The project name cannot be blank"
          : undefined,
    });
    if (name) {
      actions.setProjectName(name);
    }
  }, [dialogs, actions, project]);
  return (
    <HStack spacing={2.5}>
      <Tooltip
        hasArrow
        label="Edit the name of your project"
        placement="top-start"
      >
        <IconButton
          size="md"
          icon={<RiEdit2Line />}
          color="gray.500"
          variant="ghost"
          onClick={handleEdit}
          aria-label="Edit project name"
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
    </HStack>
  );
};

export default ProjectNameEditable;
