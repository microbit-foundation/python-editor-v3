/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Flex, HStack, Image, Stack, Text, VStack } from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../../common/GenericDialog";
import chromeOSErrorImage from "./chrome-os-105-error.png";
import { FinalFocusRef } from "../../project/project-actions";

// Temporary workaround for ChromeOS 105 bug.
// See https://bugs.chromium.org/p/chromium/issues/detail?id=1363712&q=usb&can=2
export const isChromeOS105 = (): boolean => {
  const userAgent = navigator.userAgent;
  return /CrOS/.test(userAgent) && /Chrome\/105\b/.test(userAgent);
};

interface WebUSBDialogProps {
  callback: () => void;
  finalFocusRef: FinalFocusRef;
}

export const WebUSBDialog = ({
  callback,
  finalFocusRef,
}: WebUSBDialogProps) => {
  const handleClose = useCallback(() => {
    callback();
  }, [callback]);
  return (
    <GenericDialog
      finalFocusRef={finalFocusRef}
      onClose={handleClose}
      body={
        isChromeOS105() ? <Chrome105ErrorBody /> : <NotSupportedErrorBody />
      }
      footer={<WebUSBDialogFooter onCancel={handleClose} />}
      size="3xl"
    />
  );
};

const DialogBodyWrapper = ({ children }: { children: ReactNode }) => (
  <VStack
    width="auto"
    ml="auto"
    mr="auto"
    p={8}
    pb={0}
    spacing={5}
    alignItems="flex-start"
  >
    {children}
  </VStack>
);

const NotSupportedErrorBody = () => {
  return (
    <DialogBodyWrapper>
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        <FormattedMessage id="webusb-not-supported-title" />
      </Text>
      <Text>
        <FormattedMessage id="webusb-not-supported" />
      </Text>
      <Text>
        <FormattedMessage id="webusb-why-use" />
      </Text>
    </DialogBodyWrapper>
  );
};

const Chrome105ErrorBody = () => {
  return (
    <DialogBodyWrapper>
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        There is an issue with Chrome OS version 105 and WebUSB*
      </Text>
      <HStack spacing={5}>
        <Stack>
          <Text>
            Unfortunately “Send to micro:bit” does not work in this particular
            Chrome OS version due to a bug in the operating system. The next
            version of Chrome OS, version 106, expected October 2022, should
            contain a fix for this.
          </Text>
          <Text fontSize="md">
            Your program will be saved to your computer instead. Follow the
            steps on the next screen to transfer it to your micro:bit.
          </Text>
          <Text fontSize="sm">
            *<FormattedMessage id="webusb-why-use" />
          </Text>
        </Stack>
        <Flex justifyContent="center" width="100%">
          <Image
            width="100%"
            height="100%"
            src={chromeOSErrorImage}
            alt=""
            pb={3}
          />
        </Flex>
      </HStack>
    </DialogBodyWrapper>
  );
};

interface WebUSBDialogFooterProps {
  onCancel: () => void;
}

const WebUSBDialogFooter = ({ onCancel }: WebUSBDialogFooterProps) => {
  return (
    <HStack spacing={2.5}>
      <Button onClick={onCancel} size="lg" variant="solid">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

export default WebUSBDialog;
