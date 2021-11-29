/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link, Text, VStack } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/modal";
import { useEffect, useRef } from "react";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Temporary embedded Jotform for the alpha release.
 */
const FeedbackForm = ({ isOpen, onClose }: FeedbackFormProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const listener = (message: MessageEvent) => {
      if (
        message.origin === "https://form.jotform.com" &&
        typeof message.data === "string"
      ) {
        const args = message.data.split(":");
        // There are many other cases in their big blob of script
        // but I think this is all we need to care about.
        if (args[0] === "setHeight" && iframeRef.current) {
          iframeRef.current.style.height = args[1] + "px";
        }
      }
    };
    window.addEventListener("message", listener);
    return () => {
      window.removeEventListener("message", listener);
    };
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay>
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <VStack pl={8} pr={8} pt={8} spacing={5} alignItems="stretch">
              <Text fontWeight="semibold">
                Welcome to the alpha release of the new micro:bit Python editor.
              </Text>
              <Text>
                This editor will change rapidly and sometimes things will break.
                Use the{" "}
                <Link color="brand.600" href="https://python.microbit.org">
                  stable editor
                </Link>{" "}
                for day-to-day use.
              </Text>
            </VStack>
            <iframe
              ref={iframeRef}
              title="Python editor feedback"
              src="https://form.jotform.com/211534485207352"
              frameBorder="0"
              height="620px"
              width="100%"
              scrolling="no"
            />
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default FeedbackForm;
