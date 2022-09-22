/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { HStack, SimpleGrid, Text, VStack, Link, Icon } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { deployment } from "../deployment";
import { Language, supportedLanguages, useSettings } from "./settings";

interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalFocusRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Language setting dialog.
 */
export const LanguageDialog = ({
  isOpen,
  onClose,
  finalFocusRef,
}: LanguageDialogProps) => {
  const [settings, setSettings] = useSettings();
  const handleChooseLanguage = useCallback(
    (languageId: string) => {
      setSettings({
        ...settings,
        languageId,
      });
      onClose();
    },
    [settings, setSettings, onClose]
  );
  const hasPreviewLanguages = supportedLanguages.some((l) => l.preview);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      finalFocusRef={finalFocusRef}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            <FormattedMessage id="language" />
          </ModalHeader>
          <ModalBody>
            <VStack spacing={8} width="100%">
              <SimpleGrid width="100%" columns={[1, 1, 2, 2]} spacing={4}>
                {supportedLanguages.map((language) => (
                  <LanguageCard
                    key={language.id}
                    language={language}
                    onChooseLanguage={handleChooseLanguage}
                  />
                ))}
              </SimpleGrid>
              <Link
                pl={1}
                alignSelf="flex-start"
                href={deployment.translationLink}
                target="_blank"
                rel="noopener"
                color="brand.500"
              >
                <FormattedMessage id="help-translate" />{" "}
                <Icon as={RiExternalLinkLine} />
              </Link>
            </VStack>
            {hasPreviewLanguages && (
              <Text fontSize="xs" alignSelf="flex-end" mt={1}>
                * These languages are an early preview of in-progress
                translations.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="solid" onClick={onClose}>
              <FormattedMessage id="close-action" />
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

interface LanguageCardProps {
  language: Language;
  onChooseLanguage: (languageId: string) => void;
}

const LanguageCard = ({ language, onChooseLanguage }: LanguageCardProps) => {
  return (
    <Button
      padding={3}
      variant="language"
      alignItems="stretch"
      borderRadius="xl"
      onClick={() => onChooseLanguage(language.id)}
      height="auto"
      data-testid={language.id}
    >
      <HStack>
        <VStack alignItems="left">
          <Text fontSize="lg" fontWeight="semibold">
            {language.name}
          </Text>
          <Text fontWeight="normal" fontSize="sm" color="gray.700">
            {language.enName}
            {language.preview ? "*" : null}
          </Text>
        </VStack>
      </HStack>
    </Button>
  );
};
