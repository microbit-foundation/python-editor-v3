/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback } from "react";
import FeedbackForm from "./FeedbackForm";
import { ReleaseNoticeState } from "./PreReleaseNotice";
import WelcomeDialog from "./WelcomeDialog";
import { useDeployment } from "../deployment";

interface ReleaseDialogsProps {
  dialog: ReleaseNoticeState;
  onDialogChange: (state: ReleaseNoticeState) => void;
}

const ReleaseDialogs = ({ dialog, onDialogChange }: ReleaseDialogsProps) => {
  const { welcomeVideoYouTubeId } = useDeployment();
  const handleClose = useCallback(() => {
    onDialogChange("closed");
  }, [onDialogChange]);
  if (dialog === "feedback") {
    return <FeedbackForm isOpen onClose={handleClose} />;
  }
  if (dialog === "info" && welcomeVideoYouTubeId) {
    return (
      <WelcomeDialog
        isOpen
        onClose={handleClose}
        youtubeId={welcomeVideoYouTubeId}
      />
    );
  }
  return null;
};

export default ReleaseDialogs;
