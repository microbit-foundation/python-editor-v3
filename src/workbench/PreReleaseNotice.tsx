/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Text } from "@microbit/ui";
import { useCallback, useEffect, useState } from "react";
import { RiFeedbackFill, RiInformationFill } from "react-icons/ri";
import { HStack, styled } from "styled-system/jsx";
import { useStorage } from "../common/use-storage";
import { useCookieConsent, useDeployment } from "../deployment";
import { flags } from "../flags";

export type ReleaseNoticeState = "info" | "feedback" | "closed";

// Bump this to show the notice again.
const currentVersion = 3;

interface ReleaseNoticeStorage {
  version: number;
}

const isReleaseNoticeStorage = (v: unknown): v is ReleaseNoticeStorage => {
  return typeof v === "object" && Number.isInteger((v as any).version);
};

interface PreReleaseNoticeProps {
  onDialogChange: (state: ReleaseNoticeState) => void;
}

export const useReleaseDialogState = (): [
  ReleaseNoticeState,
  React.Dispatch<React.SetStateAction<ReleaseNoticeState>>
] => {
  const [storedNotice, setStoredNotice] = useStorage(
    "local",
    "release-notice",
    { version: 0 },
    isReleaseNoticeStorage
  );
  const [releaseDialog, setReleaseDialog] =
    useState<ReleaseNoticeState>("closed");
  // Show the dialog on start-up once per user once we have cookie consent.
  const cookieConsent = useCookieConsent();
  useEffect(() => {
    if (
      cookieConsent &&
      !flags.noWelcome &&
      storedNotice.version < currentVersion
    ) {
      setReleaseDialog("info");
      setStoredNotice({ version: currentVersion });
    }
  }, [cookieConsent, storedNotice, setStoredNotice, setReleaseDialog]);
  return [releaseDialog, setReleaseDialog];
};

const PreReleaseNotice = ({ onDialogChange }: PreReleaseNoticeProps) => {
  const { welcomeVideoYouTubeId: hasInfoDialog } = useDeployment();
  const openInfoDialog = useCallback(() => {
    onDialogChange("info");
  }, [onDialogChange]);
  const openFeedbackDialog = useCallback(() => {
    onDialogChange("feedback");
  }, [onDialogChange]);
  return (
    <styled.section
      display="flex"
      bgColor="gray.800"
      color="white"
      p="1"
      pl="3"
      pr="3"
      justifyContent="space-between"
      aria-label="Release information"
      role="region"
    >
      <Text fontSize="sm" textAlign="center" fontWeight="semibold" p="1">
        Beta release
      </Text>
      <HStack>
        {hasInfoDialog && (
          <Button
            leftIcon={<RiInformationFill />}
            variant="link"
            size="xs"
            css={{ color: "white", p: "1", fontWeight: "semibold" }}
            onPress={openInfoDialog}
          >
            More
          </Button>
        )}
        <Button
          leftIcon={<RiFeedbackFill />}
          variant="link"
          size="xs"
          css={{ color: "white", p: "1", fontWeight: "semibold" }}
          onPress={openFeedbackDialog}
        >
          Feedback
        </Button>
      </HStack>
    </styled.section>
  );
};

export default PreReleaseNotice;
