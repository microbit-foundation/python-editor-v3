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

interface DownloadButtonProps
  extends Omit<CollapsibleButtonProps, "onClick" | "text" | "icon"> {}

/**
 * Download HEX button.
 *
 * This is the main action for programming the micro:bit if the
 * system does not support WebUSB.
 *
 * Otherwise it's a more minor action.
 */
const DownloadButton = (props: DownloadButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  return (
    <Tooltip
      hasArrow
      placement="top-start"
      label={intl.formatMessage({
        id: "download-hover",
      })}
    >
      <CollapsibleButton
        {...props}
        icon={<RiDownload2Line />}
        onClick={actions.download}
        text={intl.formatMessage({
          id: "download-action",
        })}
      />
    </Tooltip>
  );
};

export default DownloadButton;
