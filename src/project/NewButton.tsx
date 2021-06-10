import { Tooltip } from "@chakra-ui/tooltip";
import { RiFileAddLine } from "react-icons/ri";
import { useIntl } from "react-intl";
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
  const intl = useIntl();
  return (
    <Tooltip
      hasArrow
      label={intl.formatMessage({
        id: "create-python",
      })}
    >
      <CollapsableButton
        {...props}
        text="Create new file"
        onClick={actions.createFile}
        icon={<RiFileAddLine />}
      />
    </Tooltip>
  );
};

export default NewButton;
