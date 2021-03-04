import {
  Button,
  HStack,
  IconButton,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback } from "react";
import { RiExternalLinkLine, RiFileCopy2Line } from "react-icons/ri";
import Separate from "../common/Separate";
import useActionFeedback from "../common/use-action-feedback";
import config from "../config";
import { copyVersion, versionInfo } from "./HelpMenu";

/**
 * Help as a tab.
 */
const Help = () => {
  const externalLinkIcon = <RiExternalLinkLine style={{ display: "inline" }} />;
  const actionFeedback = useActionFeedback();
  const handleCopyVersion = useCallback(() => {
    copyVersion(actionFeedback);
  }, [actionFeedback]);
  return (
    <VStack alignItems="stretch" p={2} spacing={5}>
      <VStack alignItems="stretch">
        <Link href={config.documentationLink}>
          {externalLinkIcon} Documentation
        </Link>
        <Link href={config.supportLink}>{externalLinkIcon} Support</Link>
      </VStack>
      <HStack flexWrap="wrap" justifyContent="space-between">
        <Text fontSize="xs">
          <Separate separator={(key) => <br key={key} />}>
            {versionInfo}
          </Separate>
        </Text>
        <IconButton
          onClick={handleCopyVersion}
          icon={<RiFileCopy2Line />}
          variant="outline"
          aria-label="Copy version information to the clipboard"
        />
      </HStack>
    </VStack>
  );
};

export default Help;
