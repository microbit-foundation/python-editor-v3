import { RiUpload2Fill } from "react-icons/ri";
import { CollapsableButtonComposibleProps } from "../common/CollapsibleButton";
import FileInputButton from "../common/FileInputButton";
import { useProjectActions } from "./project-hooks";

interface UploadButtonProps extends CollapsableButtonComposibleProps {}

/**
 * Upload button, with an associated input field.
 *
 * This adds or updates files in the file system rather than switching project.
 */
const UploadButton = (props: UploadButtonProps) => {
  const actions = useProjectActions();
  return (
    // TODO: Tooltip breaks this, why?
    <FileInputButton
      {...props}
      text="Upload"
      data-testid="upload"
      onOpen={actions.addOrUpdateFile}
      icon={<RiUpload2Fill />}
    />
  );
};

export default UploadButton;
