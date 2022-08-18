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
import { ReactNode, useCallback, useState } from "react";
import { RiSendPlane2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import {
  RadioMessage as RadioMessageType,
  RadioSensor as RadioSensorType,
} from "./model";
import { ReactComponent as MessageIcon } from "./icons/microbit-face-icon.svg";

const messageLimit = 100;

interface RadioModuleProps {
  icon: ReactNode;
  sensor: RadioSensorType;
  onSensorChange: (id: string, value: any) => void;
  minimised: boolean;
}

const RadioModule = ({
  icon,
  sensor,
  onSensorChange,
  minimised,
}: RadioModuleProps) => {
  const filteredRadioMessages = sensor.value.filter(
    (v) => v.group === sensor.group
  );
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
                <Box>Group {sensor.group}</Box>
                <Divider borderWidth="1px" />
              </VStack>
              <VStack
                width="100%"
                alignItems="flex-start"
                maxH="12rem"
                minH="12rem"
                overflowY="auto"
              >
                {filteredRadioMessages.length > messageLimit && (
                  <Text>Older messages not shown</Text>
                )}
                {filteredRadioMessages.slice(messageLimit * -1).map((v, i) => (
                  <RadioMessage key={i} message={v.message} source={v.source} />
                ))}
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
      <Box bg={color} p={2} borderRadius="md">
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
        aria-label={intl.formatMessage({ id: "simulator-gesture-send" })}
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
