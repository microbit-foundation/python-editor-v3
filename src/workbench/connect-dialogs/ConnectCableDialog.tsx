/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image } from "@microbit/ui";
import { FormattedMessage } from "react-intl";
import { Flex, VStack } from "styled-system/jsx";
import DialogHeading from "../../common/DialogHeading";
import connectCable from "./connect-cable.gif";

const ConnectCableDialogBody = () => {
  return (
    <VStack
      width="auto"
      ml="auto"
      mr="auto"
      p="5"
      pb="0"
      gap="5"
      alignItems="flex-start"
    >
      <DialogHeading>
        <FormattedMessage id="connect-cable-title" />
      </DialogHeading>

      <Flex justifyContent="center" width="100%">
        <Image height="372px" width="400px" src={connectCable} alt="" />
      </Flex>
    </VStack>
  );
};

export default ConnectCableDialogBody;
