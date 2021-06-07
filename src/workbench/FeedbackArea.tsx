import { Center, Link, Text, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import FeedbackForm from "./FeedbackForm";
import { FormattedMessage, useIntl, injectIntl } from "react-intl";
import { IntlProvider } from "react-intl";

const FeedbackArea = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, [setDialogOpen]);
  const intl = useIntl();
  return (
    <VStack
      mt="calc(2.6rem + 11.5vh)"
      pl={8}
      pr={8}
      spacing={5}
      alignItems="stretch"
    >
      <Text>
        {/* <FormattedMessage
          description="A message"
          defaultMessage="Hi! This is an alpha release of the new micro:bit Python editor. \n We’ve started by making sure it has all the features from the current editor. Soon we will start adding new features.\n This means the editor could change rapidly, and sometimes things might break. If you want to use a stable editor please use the main editor.\n Help us improve by providing your feedback."
        /> */}
        {intl.formatMessage({
          defaultMessage:
            "Hi! This is an alpha release of the new micro:bit Python editor. \n We’ve started by making sure it has all the features from the current editor. Soon we will start adding new features.\n This means the editor could change rapidly, and sometimes things might break. If you want to use a stable editor please use the main editor.\n Help us improve by providing your feedback.",
          id: "p+bYfA",
          description: "placeholder text",
        })}
      </Text>
      <Text>
        We’ve started by making sure it has all the features from the current
        editor. Soon we will start adding new features.
      </Text>
      <Text>
        This means the editor could change rapidly, and sometimes things might
        break. If you want to use a stable editor please use the{" "}
        <Link color="brand.500" href="https://python.microbit.org">
          main editor
        </Link>
        .
      </Text>
      <Text>Help us improve by providing your feedback.</Text>
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
