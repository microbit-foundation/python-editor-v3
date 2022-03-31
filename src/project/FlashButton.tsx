/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip } from "@chakra-ui/react";
import { RiFlashlightFill } from "react-icons/ri";
import { GoCheck } from "react-icons/go";

import { useIntl } from "react-intl";
import CollapsibleButton, {
  CollapsibleButtonProps,
} from "../common/CollapsibleButton";
import { SyncStatus, useSyncStatus } from "../device/device-hooks";
import { useProjectActions } from "./project-hooks";

/**
 * Flash button.
 */
const FlashButton = (
  props: Omit<CollapsibleButtonProps, "onClick" | "text" | "icon">
) => {
  const actions = useProjectActions();
  const intl = useIntl();
  const syncStatus = useSyncStatus();
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
          icon={
            syncStatus === SyncStatus.IN_SYNC ? (
              <GoCheck />
            ) : (
              <RiFlashlightFill />
            )
          }
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
