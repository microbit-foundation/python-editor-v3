/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback } from "react";
import FeedbackForm from "./FeedbackForm";
import WelcomeDialog from "./WelcomeDialog";
import { ReleaseNoticeState } from "./PreReleaseNotice";
import { flags } from "../flags";
import PreReleaseDialog from "./PreReleaseDialog";

interface ReleaseDialogsProps {
  dialog: ReleaseNoticeState;
  onDialogChange: (state: ReleaseNoticeState) => void;
}

const ReleaseDialogs = ({ dialog, onDialogChange }: ReleaseDialogsProps) => {
  const handleClose = useCallback(() => {
    onDialogChange("closed");
  }, [onDialogChange]);
  const handleFeedback = useCallback(() => {
    onDialogChange("feedback");
  }, [onDialogChange]);

  if (dialog === "feedback") {
    return <FeedbackForm isOpen onClose={handleClose} />;
  }
  if (dialog === "info") {
    if (flags.livePreview) {
      return <WelcomeDialog isOpen onClose={handleClose} />;
    } else {
      return (
        <PreReleaseDialog
          isOpen
          onClose={handleClose}
          onFeedback={handleFeedback}
        />
      );
    }
  }
  return null;
};

export default ReleaseDialogs;
