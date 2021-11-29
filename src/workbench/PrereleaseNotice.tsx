import { Button } from "@chakra-ui/button";
import { Flex, HStack, Text } from "@chakra-ui/layout";
import { useCallback, useState } from "react";
import { RiFeedbackFill, RiInformationFill } from "react-icons/ri";
import FeedbackForm from "./FeedbackForm";
import InfoDialog from "./InfoDialog";

type DialogState = "info" | "feedback" | "closed";

const PrereleaseNotice = () => {
  const [dialogOpen, setDialogOpen] = useState<DialogState>("closed");
  const openInfoDialog = useCallback(() => {
    setDialogOpen("info");
  }, [setDialogOpen]);
  const openFeedbackDialog = useCallback(() => {
    setDialogOpen("feedback");
  }, [setDialogOpen]);
  const closeDialog = useCallback(() => {
    setDialogOpen("closed");
  }, [setDialogOpen]);

  return (
    <Flex
      bgColor="gray.800"
      color="white"
      p={1}
      pl={3}
      pr={3}
      justifyContent="space-between"
    >
      <Text fontSize="sm" textAlign="center" fontWeight="semibold" p={1}>
        Alpha release
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
      {dialogOpen === "feedback" && (
        <FeedbackForm
          isOpen={dialogOpen === "feedback"}
          onClose={closeDialog}
        />
      )}
      {dialogOpen === "info" && (
        <InfoDialog
          switchToInfoDialog={openFeedbackDialog}
          isOpen={dialogOpen === "info"}
          info
          onClose={closeDialog}
        />
      )}
    </Flex>
  );
};

export default PrereleaseNotice;
