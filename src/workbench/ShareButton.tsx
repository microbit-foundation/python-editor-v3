import { Button, ButtonProps } from "@chakra-ui/react";
import React, { useCallback } from "react";
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
    <Button
      leftIcon={<RiShareLine />}
      onClick={handleShare}
      {...props}
      variant="outline"
    >
      Share
    </Button>
  );
};

export default ShareButton;
