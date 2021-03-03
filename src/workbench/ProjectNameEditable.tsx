import React, { useState } from "react";
import {
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  IconButton,
  UseEditableReturn,
} from "@chakra-ui/react";
import { RiEdit2Line } from "react-icons/ri";

/**
 * A control to enable editing of the project name.
 *
 * Not yet wired up to any state.
 *
 * Needs review on mobile/tablet.
 */
const ProjectNameEditable = () => {
  const EditableControls = ({
    isEditing,
    onEdit,
  }: Pick<
    UseEditableReturn,
    "isEditing" | "onSubmit" | "onCancel" | "onEdit"
  >) => {
    return isEditing ? null : (
      <Flex justifyContent="center" display="inline" marginLeft={2}>
        <IconButton
          size="md"
          icon={<RiEdit2Line />}
          onClick={onEdit}
          aria-label="Edit project name"
          variant="outline"
        />
      </Flex>
    );
  };
  const [edited, setEdited] = useState(false);
  const handleChange = () => setEdited(true);
  return (
    <Editable
      display="flex"
      defaultValue={"Name your project"}
      whiteSpace="nowrap"
      onChange={handleChange}
    >
      {(props) => (
        <>
          <EditablePreview
            color={!edited ? "grey" : undefined}
            display="flex"
            alignItems="center"
          />
          <EditableInput placeholder="Name your project!" padding={1} />
          <EditableControls {...props} />
        </>
      )}
    </Editable>
  );
};

export default ProjectNameEditable;
