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
import { RadioState } from "../device/simulator";
import { ReactComponent as MessageIcon } from "./icons/microbit-face-icon.svg";

const messageLimit = 100;

interface RadioModuleProps {
  icon: ReactNode;
  state: RadioState;
  onSensorChange: (id: string, value: any) => void;
  minimised: boolean;
}

const RadioModule = ({
  icon,
  state,
  onSensorChange,
  minimised,
}: RadioModuleProps) => {
  const filteredRadioMessages = sensor.value.filter(
    (v) => v.group === sensor.group
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
  }, [scrollToBottom, sensor]);
  return (
    <HStack pb={minimised ? 0 : 2} pt={minimised ? 0 : 1} spacing={3}>
      {minimised ? (
        <>
          {icon}
          <RadioInput sensor={sensor} onSensorChange={onSensorChange} />
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
                {filteredRadioMessages.length > messageLimit && (
                  <Text color="gray.700" opacity="80%">
                    <FormattedMessage id="simulator-radio-message-limit" />
                  </Text>
                )}
                {filteredRadioMessages.slice(messageLimit * -1).map((v, i) => (
                  <RadioMessage key={i} message={v.message} source={v.source} />
                ))}
                {!filteredRadioMessages.length && (
                  <VStack flex="1 1 auto" justifyContent="center">
                    <Text color="gray.700" opacity="80%">
                      <FormattedMessage id="simulator-radio-no-messages" />
                    </Text>
                  </VStack>
                )}
              </VStack>
            </VStack>
          </Box>
          <RadioInput sensor={sensor} onSensorChange={onSensorChange} />
        </VStack>
      )}
    </HStack>
  );
};

const RadioMessageIcon = ({ color }: { color: string }) => (
  <Icon color={color} h={10} w={10} as={MessageIcon} />
);

const RadioMessage = ({
  source,
  message,
}: {
  source: "code" | "user";
  message: string;
}) => {
  const color = source === "code" ? "blimpTeal.300" : "brand.200";
  return (
    <Flex
      gap="10px"
      flexDirection={source === "code" ? "row" : "row-reverse"}
      alignSelf={source === "code" ? "flex-start" : "flex-end"}
    >
      <RadioMessageIcon color={color} />
      <Box bg={color} p={2} borderRadius="md" wordBreak="break-word">
        {message}
      </Box>
    </Flex>
  );
};

interface RadioInputProps {
  sensor: RadioSensorType;
  onSensorChange: (id: string, value: any) => void;
}

const RadioInput = ({ sensor, onSensorChange }: RadioInputProps) => {
  const intl = useIntl();
  const [message, setMessage] = useState<string>("");
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const radioMessages = [...sensor.value];
      const cappedRadioMessages = capRadioMessages(radioMessages);
      cappedRadioMessages.push({
        message,
        group: sensor.group,
        source: "user",
      });
      onSensorChange(sensor.id, cappedRadioMessages);
      setMessage("");
    },
    [message, onSensorChange, sensor]
  );
  return (
    <HStack as="form" onSubmit={handleSubmit} spacing={3}>
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={!sensor.enabled}
        bg="white"
      ></Input>
      <IconButton
        icon={<RiSendPlane2Line />}
        colorScheme="blackAlpha"
        disabled={!sensor.enabled}
        onClick={handleSubmit}
        aria-label={intl.formatMessage({ id: "simulator-radio-send" })}
      ></IconButton>
    </HStack>
  );
};

const capRadioMessages = (
  radioMessages: RadioMessageType[]
): RadioMessageType[] => {
  const cappedRadioMessages: RadioMessageType[] = [];
  const uniqueGroups = new Set(radioMessages.map((m) => m.group));
  const radioMessagesByGroup: Record<string, RadioMessageType[]> = {};
  uniqueGroups.forEach((group) => {
    radioMessagesByGroup[group] = radioMessages.filter(
      (m) => m.group === group
    );
  });
  for (const group in radioMessagesByGroup) {
    const messages = radioMessagesByGroup[group];
    while (messages.length > messageLimit + 1) {
      messages.shift();
    }
    cappedRadioMessages.push(...messages);
  }
  return cappedRadioMessages;
};

export default RadioModule;
