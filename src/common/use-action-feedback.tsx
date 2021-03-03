import React, { ReactNode } from "react";
import { Link, useToast } from "@chakra-ui/react";
import { useMemo } from "react";
import config from "../config";

export class ActionFeedback {
  constructor(private toast: ReturnType<typeof useToast>) {}

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
    });
  }

  /**
   * Handles an unexpected error for which we can provide no good context or text.
   * @param error the error thrown.
   */
  unexpectedError(error: Error) {
    // For now at least.
    console.error(error);
    this.toast({
      title: "An unexpected error occurred",
      status: "error",
      description: (
        <>
          Please try again or{" "}
          <Link
            href={config.supportLink}
            target="_blank"
            rel="noopener"
            textDecoration="underline"
          >
            raise a support request
          </Link>
          .
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
  return useMemo(() => new ActionFeedback(toast), [toast]);
};

export default useActionFeedback;
