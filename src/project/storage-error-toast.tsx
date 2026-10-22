/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ToastOptions, useToast } from "@microbit/ui";
import { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";
import { useProjectsIfAvailable } from "./projects-hooks";
import { ProjectSaveErrorEvent } from "./projects";

const toastId = "storage-error";

export const isQuotaExceededError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "QuotaExceededError";

/**
 * Shows the persistent "storage full" or "failed to save" toast, the same
 * one as ml-trainer. Repeat failures update the toast rather than stacking.
 */
export const useShowStorageError = (): ((error: unknown) => void) => {
  const toast = useToast();
  const intl = useIntl();
  return useCallback(
    (error: unknown) => {
      const options: ToastOptions = {
        id: toastId,
        status: "error",
        persistent: true,
        ...(isQuotaExceededError(error)
          ? {
              title: intl.formatMessage({ id: "storage-error-quota-title" }),
              description: intl.formatMessage({
                id: "storage-error-quota-description",
              }),
            }
          : { title: intl.formatMessage({ id: "storage-error-other" }) }),
      };
      if (toast.isActive(toastId)) {
        toast.update(toastId, options);
      } else {
        toast(options);
      }
    },
    [intl, toast]
  );
};

/**
 * Tells the user when the open project stops saving to the projects
 * database. Nothing to do in iframe mode, where the host owns the project.
 */
const StorageErrorToast = () => {
  const projects = useProjectsIfAvailable();
  const showStorageError = useShowStorageError();
  useEffect(() => {
    if (!projects) {
      return;
    }
    const listener = (e: ProjectSaveErrorEvent) => showStorageError(e.error);
    projects.addEventListener("saveerror", listener);
    return () => projects.removeEventListener("saveerror", listener);
  }, [projects, showStorageError]);
  return null;
};

export default StorageErrorToast;
