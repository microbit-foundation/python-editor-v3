/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip } from "@chakra-ui/tooltip";
import { RiRestartLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsibleButton, {
  CollapsibleButtonComposableProps,
} from "../common/CollapsibleButton";
import { useProjectActions } from "./project-hooks";

interface ResetButtonProps extends CollapsibleButtonComposableProps {}

/**
 * Resets the project to the default.
 */
const ResetButton = (props: ResetButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  return (
    <Tooltip
      hasArrow
      label={intl.formatMessage({
        id: "reset-project-hover",
      })}
    >
      <CollapsibleButton
        {...props}
        text={intl.formatMessage({
          id: "reset-project-action",
        })}
        onClick={actions.reset}
        icon={<RiRestartLine />}
      />
    </Tooltip>
  );
};

export default ResetButton;
