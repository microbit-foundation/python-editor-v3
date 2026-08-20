/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@microbit/ui";
import { useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
import { HStack } from "styled-system/jsx";
import { GenericDialog } from "../../common/GenericDialog";
import ConnectCableDialogBody from "./ConnectCableDialog";
import ConnectHelpDialogBody from "./ConnectHelpDialog";
import { FinalFocusRef } from "../../project/project-actions";

export const enum ConnectHelpChoice {
  Next,
  NextDontShowAgain,
  Cancel,
}

interface ConnectHelpDialogProps {
  callback: (choice: ConnectHelpChoice) => void;
  dialogNormallyHidden: boolean;
  shownByRequest: boolean;
  finalFocusRef: FinalFocusRef;
}

const enum Stage {
  ConnectCable,
  ConnectHelp,
}

const ConnectDialog = ({
  callback,
  dialogNormallyHidden,
  shownByRequest,
  finalFocusRef,
}: ConnectHelpDialogProps) => {
  const [stage, setStage] = useState<Stage>(Stage.ConnectCable);
  const handleNext = useCallback(() => {
    if (stage === Stage.ConnectCable) {
      setStage(Stage.ConnectHelp);
    } else {
      callback(ConnectHelpChoice.Next);
    }
  }, [callback, stage]);
  return (
    <GenericDialog
      finalFocusRef={finalFocusRef}
      onClose={() => callback(ConnectHelpChoice.Cancel)}
      body={
        stage === Stage.ConnectCable ? (
          <ConnectCableDialogBody />
        ) : (
          <ConnectHelpDialogBody />
        )
      }
      footer={
        <ConnectDialogFooter
          stage={stage}
          onBack={() => setStage(Stage.ConnectCable)}
          onClose={() => callback(ConnectHelpChoice.Cancel)}
          onNext={handleNext}
          onNextDontShowAgain={() =>
            callback(ConnectHelpChoice.NextDontShowAgain)
          }
          dialogNormallyHidden={dialogNormallyHidden}
          shownByRequest={shownByRequest}
        />
      }
      size="3xl"
    />
  );
};

interface ConnectDialogFooterProps {
  stage: Stage;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  onNextDontShowAgain: () => void;
  dialogNormallyHidden: boolean;
  shownByRequest: boolean;
}

const ConnectDialogFooter = ({
  stage,
  onBack,
  onClose,
  onNext,
  onNextDontShowAgain,
  dialogNormallyHidden,
  shownByRequest,
}: ConnectDialogFooterProps) => {
  return (
    <HStack
      gap="2.5"
      width={dialogNormallyHidden || shownByRequest ? "auto" : "100%"}
    >
      {!dialogNormallyHidden && !shownByRequest && (
        <Button
          variant="link"
          size="lg"
          onPress={onNextDontShowAgain}
          css={{ color: "fg.link", mr: "auto" }}
        >
          <FormattedMessage id="dont-show-again" />
        </Button>
      )}
      {stage === Stage.ConnectCable ? (
        <Button onPress={onClose} size="lg">
          <FormattedMessage id="cancel-action" />
        </Button>
      ) : (
        <Button onPress={onBack} size="lg">
          <FormattedMessage id="back-action" />
        </Button>
      )}

      <Button onPress={onNext} variant="primary" size="lg">
        <FormattedMessage id="next-action" />
      </Button>
    </HStack>
  );
};

export default ConnectDialog;
