import {
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  IconButton,
  Tooltip,
  UseEditableReturn,
} from "@chakra-ui/react";
import { useState } from "react";
import { RiEdit2Line } from "react-icons/ri";
import { useProject, useProjectActions } from "./project-hooks";

/**
 * A control to enable editing of the project name.
 */
const ProjectNameEditable = () => {
  const { name: projectName } = useProject();
  const actions = useProjectActions();
  const [keyPart, setKeyPart] = useState(0);
  const handleSubmit = (projectName: string) => {
    if (projectName.trim()) {
      actions.setProjectName(projectName);
    }
    setKeyPart(keyPart + 1);
  };

  const EditableControls = ({
    isEditing,
    onEdit,
  }: Pick<
    UseEditableReturn,
    "isEditing" | "onSubmit" | "onCancel" | "onEdit"
  >) => {
    return isEditing ? null : (
      <Flex justifyContent="center" display="inline" marginLeft={2}>
        <Tooltip
          hasArrow
          label="Edit the name of your project"
          placement="top-start"
        >
          <IconButton
            size="md"
            icon={<RiEdit2Line />}
            onClick={onEdit}
            aria-label="Edit project name"
            variant="outline"
            colorScheme="gray"
          />
        </Tooltip>
      </Flex>
    );
  };

  return (
    <Editable
      // Uncontrolled. Change the key so we re-render if the name was reverted.
      key={`${projectName}-${keyPart}`}
      display="flex"
      whiteSpace="nowrap"
      defaultValue={projectName}
      onSubmit={handleSubmit}
      justifyContent="space-between"
      width="15ch"
    >
      {(props) => (
        <>
          <EditablePreview
            data-testid="project-name"
            display="block"
            alignSelf="center"
            textOverflow="ellipsis"
            overflowX="hidden"
            whiteSpace="nowrap"
          />
          <EditableInput data-testid="project-name-input" padding={1} />
          <EditableControls {...props} />
        </>
      )}
    </Editable>
  );
};

export default ProjectNameEditable;
