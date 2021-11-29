import { Button } from "@chakra-ui/button";
import { Flex, Text } from "@chakra-ui/layout";
import { useCallback, useState } from "react";
import FeedbackForm from "./FeedbackForm";

const PrereleaseNotice = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
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
      <Button variant="link" color="white" size="xs" p={1} onClick={openDialog}>
        Find out more
      </Button>
      {dialogOpen && <FeedbackForm isOpen={dialogOpen} onClose={closeDialog} />}
    </Flex>
  );
};

export default PrereleaseNotice;
