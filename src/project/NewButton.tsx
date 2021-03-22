import { Tooltip } from "@chakra-ui/tooltip";
import React from "react";
import { RiFile3Line } from "react-icons/ri";
import CollapsableButton, {
  CollapsableButtonComposibleProps,
} from "../common/CollapsibleButton";
import { useProjectActions } from "./project-hooks";

interface NewButtonProps extends CollapsableButtonComposibleProps {}

/**
 * Upload button, with an associated input field.
 *
 * This adds or updates files in the file system rather than switching project.
 */
const NewButton = (props: NewButtonProps) => {
  const actions = useProjectActions();
  return (
    <Tooltip hasArrow label="Create a new Python file">
      <CollapsableButton
        {...props}
        text="Create new file"
        onClick={actions.createFile}
        icon={<RiFile3Line />}
      />
    </Tooltip>
  );
};

export default NewButton;
