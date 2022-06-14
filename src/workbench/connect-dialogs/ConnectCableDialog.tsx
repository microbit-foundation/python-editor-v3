/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, Image, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import connectCable from "./connect-cable.gif";

const ConnectCableDialogBody = () => {
  return (
    <VStack
      width="auto"
      ml="auto"
      mr="auto"
      p={5}
      pb={0}
      spacing={5}
      alignItems="flex-start"
    >
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        <FormattedMessage id="connect-cable-title" />
      </Text>

      <Flex justifyContent="center" width="100%">
        <Image height="372px" width="400px" src={connectCable} alt="" />
      </Flex>
    </VStack>
  );
};

export default ConnectCableDialogBody;
