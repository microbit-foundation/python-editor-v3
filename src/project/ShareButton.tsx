/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonProps, IconButton, Tooltip } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiShareLine } from "react-icons/ri";
import useActionFeedback from "../common/use-action-feedback";

/**
 * Share the current project.
 */
const ShareButton = (props: ButtonProps) => {
  const actionFeedback = useActionFeedback();
  const handleShare = useCallback(() => {
    actionFeedback.expectedError({
      title: "Not implemented",
      description: "This is a stub feature so we can work through UI placement",
    });
  }, [actionFeedback]);

  return (
    <Tooltip hasArrow placement="top-start" label="Share your project">
      <IconButton
        icon={<RiShareLine />}
        mode="icon"
        onClick={handleShare}
        {...props}
        aria-label="Share"
        isRound
      />
    </Tooltip>
  );
};

export default ShareButton;
