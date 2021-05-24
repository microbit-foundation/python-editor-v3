import { Tooltip } from "@chakra-ui/react";
import { RiDownload2Line } from "react-icons/ri";
import CollapsableButton, {
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
  return (
    <Tooltip hasArrow placement="top-start" label="Download a project hex file">
      <CollapsableButton
        {...props}
        variant="solid"
        icon={<RiDownload2Line />}
        onClick={actions.download}
        text="Download"
      />
    </Tooltip>
  );
};

export default DownloadButton;
