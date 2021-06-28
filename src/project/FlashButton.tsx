/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip } from "@chakra-ui/react";
import { RiFlashlightFill } from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsableButton, {
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
          id: "flash-project",
        })}
      >
        <CollapsableButton
          {...props}
          variant="solid"
          icon={<RiFlashlightFill />}
          onClick={actions.flash}
          text={intl.formatMessage({
            id: "flash-text",
          })}
        />
      </Tooltip>
    </>
  );
};

export default FlashButton;
