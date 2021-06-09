import { Center, Link, Text, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import FeedbackForm from "./FeedbackForm";
import { FormattedMessage } from "react-intl";

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
      mt="calc(2.6rem + 11.5vh)"
      pl={8}
      pr={8}
      spacing={5}
      alignItems="stretch"
    >
      <Text>
        <FormattedMessage id="welcome-message" />
      </Text>
      <Text>
        <FormattedMessage id="new-features" />
      </Text>
      <Text>
        {/* order?? */}
        <FormattedMessage id="link-editor" />{" "}
        <Link color="brand.500" href="https://python.microbit.org">
          main editor
        </Link>
        .
      </Text>
      <Text>
        <FormattedMessage id="provide-feedback" />
      </Text>
      <Center>
        <Button size="lg" onClick={openDialog}>
          Feedback
        </Button>
      </Center>
      {dialogOpen && <FeedbackForm isOpen={dialogOpen} onClose={closeDialog} />}
    </VStack>
  );
};

export default FeedbackArea;
