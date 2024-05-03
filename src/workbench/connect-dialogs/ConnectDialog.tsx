/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { HStack, Link } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
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
      spacing={2.5}
      width={dialogNormallyHidden || shownByRequest ? "auto" : "100%"}
    >
      {!dialogNormallyHidden && !shownByRequest && (
        <Link
          onClick={onNextDontShowAgain}
          as="button"
          color="brand.500"
          mr="auto"
        >
          <FormattedMessage id="dont-show-again" />
        </Link>
      )}
      {stage === Stage.ConnectCable ? (
        <Button onClick={onClose} size="lg">
          <FormattedMessage id="cancel-action" />
        </Button>
      ) : (
        <Button onClick={onBack} size="lg">
          <FormattedMessage id="back-action" />
        </Button>
      )}

      <Button onClick={onNext} variant="solid" size="lg">
        <FormattedMessage id="next-action" />
      </Button>
    </HStack>
  );
};

export default ConnectDialog;
