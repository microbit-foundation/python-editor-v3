import { Tooltip } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { RiFlashlightFill } from "react-icons/ri";
import CollapsableButton, {
  CollapsibleButtonProps
} from "../common/CollapsibleButton";
import FlashProgress from "./FlashProgress";
import { useProjectActions } from "./project-hooks";

/**
 * Flash button.
 */
const FlashButton = (
  props: Omit<CollapsibleButtonProps, "onClick" | "text" | "icon">
) => {
  const actions = useProjectActions();
  const [progress, setProgress] = useState<number | undefined>();
  const handleFlash = useCallback(() => {
    actions.flash(setProgress);
  }, [actions]);
  return (
    <>
      <FlashProgress progress={progress} />
      <Tooltip
        hasArrow
        placement="top-start"
        label="Flash the project directly to the micro:bit"
      >
        <CollapsableButton
          {...props}
          disabled={typeof progress !== "undefined"}
          icon={<RiFlashlightFill />}
          onClick={handleFlash}
          text="Flash"
        />
      </Tooltip>
    </>
  );
};

export default FlashButton;
