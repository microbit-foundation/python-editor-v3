/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Icon,
  Link,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
} from "@microbit/ui";
import { useCallback } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { Grid, HStack, VStack } from "styled-system/jsx";
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
      <ModalHeader css={{ fontSize: "lg", fontWeight: "bold" }}>
        <FormattedMessage id="language" />
      </ModalHeader>
      <ModalBody>
        <VStack gap="8" width="100%">
          <Grid width="100%" columns={{ base: 1, md: 2 }} gap="4">
            {supportedLanguages.map((language) => (
              <LanguageCard
                key={language.id}
                language={language}
                onChooseLanguage={handleChooseLanguage}
              />
            ))}
          </Grid>
          <Link
            pl="1"
            alignSelf="flex-start"
            display="inline-flex"
            alignItems="center"
            gap="1"
            href={deployment.translationLink}
            target="_blank"
            rel="noopener"
            color="brand.500"
          >
            <FormattedMessage id="help-translate" />
            <Icon as={RiExternalLinkLine} />
          </Link>
        </VStack>
        {hasPreviewLanguages && (
          <Text fontSize="xs" alignSelf="flex-end" mt="1">
            * These languages are an early preview of in-progress translations.
          </Text>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onPress={onClose}>
          <FormattedMessage id="close-action" />
        </Button>
      </ModalFooter>
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
      variant="language"
      css={{
        padding: "3",
        alignItems: "stretch",
        borderRadius: "xl",
        height: "auto",
      }}
      onPress={() => onChooseLanguage(language.id)}
      data-testid={language.id}
    >
      <HStack>
        <VStack alignItems="center">
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
