/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect, useState } from "react";
import { useStorage } from "../common/use-storage";
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
  // Show the dialog on start-up once per user.
  useEffect(() => {
    if (!flags.noWelcome && storedNotice.version < currentVersion) {
      setReleaseDialog("info");
      setStoredNotice({ version: currentVersion });
    }
  }, [storedNotice, setStoredNotice, setReleaseDialog]);
  return [releaseDialog, setReleaseDialog];
};
