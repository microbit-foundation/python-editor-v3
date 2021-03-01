import React from "react";
import { Link, useToast } from "@chakra-ui/react";
import { useMemo } from "react";
import config from "../config";

export class ActionFeedback {
  constructor(private toast: ReturnType<typeof useToast>) {}
  expectedError({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) {
    this.toast({
      title,
      status: "error",
      description,
      position: "top",
      isClosable: true,
    });
  }
  unexpectedError({ error }: { error: Error }) {
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

const useActionFeedback = () => {
  const toast = useToast();
  return useMemo(() => new ActionFeedback(toast), [toast]);
};

export default useActionFeedback;
