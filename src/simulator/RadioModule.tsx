/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { RiSendPlane2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { useSimulator } from "../device/device-hooks";
import { EVENT_RADIO_DATA, RadioState } from "../device/simulator";
import { ReactComponent as MessageIcon } from "./icons/microbit-face-icon.svg";

interface AttributedMessage {
  from: "user" | "code";
  message: string;
}

const messageLimit = 100;

interface RadioModuleProps {
  icon: ReactNode;
  state: RadioState;
  minimised: boolean;
}

const RadioModule = ({ icon, state, minimised }: RadioModuleProps) => {
  const [messages, setMessages] = useState<AttributedMessage[]>([]);
  const device = useSimulator();
  useEffect(() => {
    const handleReceive = (message: string) => {
      setMessages([...messages, { from: "code", message }]);
    };
    device.on(EVENT_RADIO_DATA, handleReceive);
    return () => {
      device.removeListener(EVENT_RADIO_DATA, handleReceive);
    };
  }, [device, messages]);
  const handleSend = useCallback(
    (message: string) => {
      setMessages([...messages, { from: "user", message }]);
      device.radioSend(message);
    },
    [device, messages]
  );

  const [scrollToBottom, setScrollToBottom] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    if (
      ref.current!.scrollTop ===
      ref.current!.scrollHeight - ref.current!.offsetHeight
    ) {
      setScrollToBottom(true);
    } else {
      setScrollToBottom(false);
    }
  }, [ref, setScrollToBottom]);
  useEffect(() => {
    if (scrollToBottom) {
      ref.current?.scrollTo({ top: ref.current?.scrollHeight });
    }
  }, [scrollToBottom]);
  return (
    <HStack pb={minimised ? 0 : 2} pt={minimised ? 0 : 1} spacing={3}>
      {minimised ? (
        <>
          {icon}
          <MessageComposer enabled={state.enabled} onSend={handleSend} />
        </>
      ) : (
        <VStack spacing={3} width="100%" alignItems="flex-start">
          <Box width="100%">
            <VStack alignItems="flex-start" bg="white" borderRadius="md" p={2}>
              <VStack width="100%" spacing={0} alignItems="flex-start">
                <Box>Group {state.group}</Box>
                <Divider borderWidth="1px" />
              </VStack>
              <VStack
                width="100%"
                maxH="12rem"
                minH="12rem"
                onScroll={handleScroll}
                overflowY="auto"
                ref={ref}
              >
                {messages.length > messageLimit && (
                  <Text color="gray.700" opacity="80%">
                    <FormattedMessage id="simulator-radio-message-limit" />
                  </Text>
                )}
                {messages.slice(messageLimit * -1).map((v, i) => (
                  <RadioMessage key={i} message={v.message} from={v.from} />
                ))}
                {!messages.length && (
                  <VStack flex="1 1 auto" justifyContent="center">
                    <Text color="gray.700" opacity="80%">
                      <FormattedMessage id="simulator-radio-no-messages" />
                    </Text>
                  </VStack>
                )}
              </VStack>
            </VStack>
          </Box>
          <MessageComposer enabled={state.enabled} onSend={handleSend} />
        </VStack>
      )}
    </HStack>
  );
};

const RadioMessageIcon = ({ color }: { color: string }) => (
  <Icon color={color} h={10} w={10} as={MessageIcon} />
);

const RadioMessage = ({
  from,
  message,
}: {
  from: "code" | "user";
  message: string;
}) => {
  const color = from === "code" ? "blimpTeal.300" : "brand.200";
  return (
    <Flex
      gap="10px"
      flexDirection={from === "code" ? "row" : "row-reverse"}
      alignSelf={from === "code" ? "flex-start" : "flex-end"}
    >
      <RadioMessageIcon color={color} />
      <Box bg={color} p={2} borderRadius="md" wordBreak="break-word">
        {message}
      </Box>
    </Flex>
  );
};

interface MessageComposerProps {
  enabled: boolean;
  onSend: (message: string) => void;
}

const MessageComposer = ({ enabled, onSend }: MessageComposerProps) => {
  const intl = useIntl();
  const [message, setMessage] = useState<string>("");
  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      onSend(message);
      setMessage("");
    },
    [message, onSend]
  );
  return (
    <HStack as="form" onSubmit={handleSendMessage} spacing={3}>
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={!enabled}
        bg="white"
      ></Input>
      <IconButton
        icon={<RiSendPlane2Line />}
        colorScheme="blackAlpha"
        disabled={!enabled}
        onClick={handleSendMessage}
        aria-label={intl.formatMessage({ id: "simulator-radio-send" })}
      ></IconButton>
    </HStack>
  );
};

export default RadioModule;
