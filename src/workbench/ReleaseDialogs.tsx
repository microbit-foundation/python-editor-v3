/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback } from "react";
import FeedbackForm from "./FeedbackForm";
import { ReleaseNoticeState } from "./release-notice-hooks";
import WelcomeDialog from "./WelcomeDialog";

interface ReleaseDialogsProps {
  dialog: ReleaseNoticeState;
  onDialogChange: (state: ReleaseNoticeState) => void;
}

const ReleaseDialogs = ({ dialog, onDialogChange }: ReleaseDialogsProps) => {
  const handleClose = useCallback(() => {
    onDialogChange("closed");
  }, [onDialogChange]);
  if (dialog === "feedback") {
    return <FeedbackForm isOpen onClose={handleClose} />;
  }
  if (dialog === "info") {
    return <WelcomeDialog isOpen onClose={handleClose} />;
  }
  return null;
};

export default ReleaseDialogs;
