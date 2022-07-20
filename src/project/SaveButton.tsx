/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip } from "@chakra-ui/react";
import { RiDownload2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsibleButton, {
  CollapsibleButtonProps,
} from "../common/CollapsibleButton";
import { useProjectActions } from "./project-hooks";

interface SaveButtonProps
  extends Omit<CollapsibleButtonProps, "onClick" | "text" | "icon"> {}

/**
 * Save HEX button.
 *
 * This is the main action for programming the micro:bit if the
 * system does not support WebUSB.
 *
 * Otherwise it's a more minor action.
 */
const SaveButton = (props: SaveButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  return (
    <Tooltip
      hasArrow
      placement="top-start"
      label={intl.formatMessage({
        id: "save-hover",
      })}
    >
      <CollapsibleButton
        {...props}
        icon={<RiDownload2Line />}
        onClick={() => actions.save()}
        text={intl.formatMessage({
          id: "save-action",
        })}
      />
    </Tooltip>
  );
};

export default SaveButton;
