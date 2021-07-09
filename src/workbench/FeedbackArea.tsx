/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link, Text, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import FeedbackForm from "./FeedbackForm";

/**
 * Temporary feedback prompt for the alpha release.
 */
const FeedbackArea = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, [setDialogOpen]);
  return (
    <VStack
      mt="calc(1.75rem + 11.5vh)"
      pl={8}
      pr={8}
      spacing={5}
      alignItems="stretch"
    >
      <Text fontWeight="semibold">
        Welcome to the alpha release of the new micro:bit Python editor.
      </Text>
      <Text>
        Right now, we have the features from the stable editor. New features
        coming soon.
      </Text>
      <Text>
        This editor will change rapidly and sometimes things will break.
      </Text>
      <VStack spacing={4} alignSelf="center" alignItems="stretch">
        <Button size="lg" onClick={openDialog}>
          Feedback
        </Button>
        <Button
          as={Link}
          size="lg"
          href="https://python.microbit.org"
          sx={{
            "&:hover": {
              textDecoration: "none",
            },
          }}
        >
          Stable editor
        </Button>
      </VStack>
      {dialogOpen && <FeedbackForm isOpen={dialogOpen} onClose={closeDialog} />}
    </VStack>
  );
};

export default FeedbackArea;
