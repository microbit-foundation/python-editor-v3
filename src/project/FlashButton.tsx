/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip } from "@chakra-ui/react";
import { RiFlashlightFill } from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsibleButton, {
  CollapsibleButtonProps,
} from "../common/CollapsibleButton";
import { useProjectActions } from "./project-hooks";

/**
 * Flash button.
 */
const FlashButton = (
  props: Omit<CollapsibleButtonProps, "onClick" | "text" | "icon">
) => {
  const actions = useProjectActions();
  const intl = useIntl();
  return (
    <>
      <Tooltip
        hasArrow
        placement="top-start"
        label={intl.formatMessage({
          id: "flash-hover",
        })}
      >
        <CollapsibleButton
          {...props}
          icon={<RiFlashlightFill />}
          onClick={actions.flash}
          text={intl.formatMessage({
            id: "flash-action",
          })}
        />
      </Tooltip>
    </>
  );
};

export default FlashButton;
