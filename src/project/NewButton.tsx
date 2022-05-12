/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip } from "@chakra-ui/tooltip";
import { RiFileAddLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsibleButton, {
  CollapsibleButtonComposableProps,
} from "../common/CollapsibleButton";
import { useProjectActions } from "./project-hooks";

interface NewButtonProps extends CollapsibleButtonComposableProps {}

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
        id: "add-python",
      })}
    >
      <CollapsibleButton
        {...props}
        text={intl.formatMessage({
          id: "add-file-action",
        })}
        onClick={actions.addFile}
        icon={<RiFileAddLine />}
      />
    </Tooltip>
  );
};

export default NewButton;
