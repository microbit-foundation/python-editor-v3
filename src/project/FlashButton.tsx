import { Tooltip } from "@chakra-ui/react";
import { RiFlashlightFill } from "react-icons/ri";
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
  return (
    <>
      <Tooltip
        hasArrow
        placement="top-start"
        label="Flash the project directly to the micro:bit"
      >
        <CollapsableButton
          {...props}
          colorScheme="designPurple"
          icon={<RiFlashlightFill />}
          onClick={actions.flash}
          text="Flash"
        />
      </Tooltip>
    </>
  );
};

export default FlashButton;
