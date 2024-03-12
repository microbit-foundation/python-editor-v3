/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useToast, ToastPosition } from "@chakra-ui/toast";
import { ReactNode, useMemo } from "react";
import { IntlShape, useIntl } from "react-intl";
import { deployment } from "../deployment";
import { Logging } from "../logging/logging";
import { useLogging } from "../logging/logging-hooks";
import MaybeLink from "./MaybeLink";

export class ActionFeedback {
  constructor(
    private toast: ReturnType<typeof useToast>,
    private logging: Logging,
    private intl: IntlShape
  ) {}

  closeAll() {
    this.toast.closeAll();
  }

  /**
   * Handles an error.
   */
  expectedError({
    title,
    description,
  }: {
    title: string;
    description: ReactNode;
  }) {
    this.toast({
      title,
      status: "error",
      description,
      position: "top",
      isClosable: true,
      variant: "toast",
    });
  }

  /**
   * Handles a warning.
   */
  warning({ title, description }: { title: string; description: ReactNode }) {
    this.toast({
      title,
      status: "warning",
      description,
      position: "top",
      isClosable: true,
      variant: "toast",
    });
  }

  /**
   * For when an action succeeds.
   */
  success({ title, description }: { title: string; description?: ReactNode }) {
    this.toast({
      title,
      status: "success",
      description,
      position: "top",
      isClosable: false,
      duration: 2000, // Quicker than for errors,
      variant: "toast",
    });
  }

  /**
   * Info, not a success/error message.
   */
  info({
    title,
    description,
    position = "top",
  }: {
    title: string;
    description?: ReactNode;
    position?: ToastPosition;
  }) {
    this.toast({
      title,
      status: "info",
      description,
      position,
      isClosable: false,
      duration: 2000, // Quicker than for errors,
      variant: "toast",
    });
  }

  /**
   * Handles an unexpected error for which we can provide no good context or text.
   * @param error the error thrown.
   */
  unexpectedError(error: any) {
    this.logging.error(error);
    this.toast({
      title: this.intl.formatMessage({ id: "unexpected-error-description" }),
      status: "error",
      description: (
        <>
          {this.intl.formatMessage(
            { id: "unexpected-error-description" },
            {
              link: (chunks: ReactNode) => (
                <MaybeLink
                  href={deployment.supportLink}
                  target="_blank"
                  rel="noopener"
                  textDecoration="underline"
                >
                  {chunks}
                </MaybeLink>
              ),
            }
          )}
        </>
      ),
      position: "top",
      isClosable: true,
    });
  }
}

/**
 * Access to global notification UI for action feedback.
 */
const useActionFeedback = () => {
  const toast = useToast();
  const logging = useLogging();
  const intl = useIntl();
  return useMemo(
    () => new ActionFeedback(toast, logging, intl),
    [toast, logging, intl]
  );
};

export default useActionFeedback;
