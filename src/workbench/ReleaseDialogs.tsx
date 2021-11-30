import { useCallback } from "react";
import FeedbackForm from "./FeedbackForm";
import InfoDialog from "./InfoDialog";
import { ReleaseNoticeState } from "./ReleaseNotice";

interface ReleaseDialogsProps {
  dialog: ReleaseNoticeState;
  onDialogChange: (state: ReleaseNoticeState) => void;
}

const ReleaseDialogs = ({ dialog, onDialogChange }: ReleaseDialogsProps) => {
  const openFeedbackDialog = useCallback(() => {
    onDialogChange("feedback");
  }, [onDialogChange]);
  const closeDialog = useCallback(() => {
    onDialogChange("closed");
  }, [onDialogChange]);
  return (
    <>
      {dialog === "feedback" && (
        <FeedbackForm isOpen={dialog === "feedback"} onClose={closeDialog} />
      )}
      {dialog === "info" && (
        <InfoDialog
          switchToInfoDialog={openFeedbackDialog}
          isOpen={dialog === "info"}
          info
          onClose={closeDialog}
        />
      )}
    </>
  );
};

export default ReleaseDialogs;
