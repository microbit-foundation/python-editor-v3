/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Flex, HStack, Text } from "@chakra-ui/layout";
import { useCallback, useEffect, useState } from "react";
import { RiFeedbackFill, RiInformationFill } from "react-icons/ri";
import { useLocalStorage } from "../common/use-local-storage";
import { flags } from "../flags";

export type ReleaseNoticeState = "info" | "feedback" | "closed";

// Bump this to show the notice again.
const currentVersion = 2;

interface ReleaseNoticeStorage {
  version: number;
}

const isReleaseNoticeStorage = (v: unknown): v is ReleaseNoticeStorage => {
  return typeof v === "object" && Number.isInteger((v as any).version);
};

interface ReleaseNoticeProps {
  onDialogChange: (state: ReleaseNoticeState) => void;
}

export const useReleaseDialogState = (): [
  ReleaseNoticeState,
  React.Dispatch<React.SetStateAction<ReleaseNoticeState>>
] => {
  const [storedNotice, setStoredNotice] = useLocalStorage(
    "release-notice",
    isReleaseNoticeStorage,
    { version: 0 }
  );
  const [releaseDialog, setReleaseDialog] =
    useState<ReleaseNoticeState>("closed");
  // Show the dialog on start-up once per user.
  useEffect(() => {
    if (!flags.noWelcome && storedNotice.version < currentVersion) {
      setReleaseDialog("info");
      setStoredNotice({ version: currentVersion });
    }
  }, [storedNotice, setStoredNotice, setReleaseDialog]);
  return [releaseDialog, setReleaseDialog];
};

const ReleaseNotice = ({ onDialogChange }: ReleaseNoticeProps) => {
  const openInfoDialog = useCallback(() => {
    onDialogChange("info");
  }, [onDialogChange]);
  const openFeedbackDialog = useCallback(() => {
    onDialogChange("feedback");
  }, [onDialogChange]);
  return (
    <Flex
      bgColor="gray.800"
      color="white"
      p={1}
      pl={3}
      pr={3}
      justifyContent="space-between"
      as="section"
      aria-label="Release information"
      role="region"
    >
      <Text fontSize="sm" textAlign="center" fontWeight="semibold" p={1}>
        Beta release
      </Text>
      <HStack>
        <Button
          leftIcon={<RiInformationFill />}
          variant="link"
          color="white"
          colorScheme="whiteAlpha"
          size="xs"
          p={1}
          onClick={openInfoDialog}
        >
          More
        </Button>
        <Button
          leftIcon={<RiFeedbackFill />}
          variant="link"
          color="white"
          colorScheme="whiteAlpha"
          size="xs"
          p={1}
          onClick={openFeedbackDialog}
        >
          Feedback
        </Button>
      </HStack>
    </Flex>
  );
};

export default ReleaseNotice;
