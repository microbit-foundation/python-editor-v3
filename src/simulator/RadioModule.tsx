/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  BoxProps,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { FormEvent, ReactNode, useCallback, useState } from "react";
import { RiSendPlane2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import MessageIcon from "./icons/microbit-face-icon.svg?react";
import { RadioChatItem, useRadioChatItems } from "./radio-hooks";
import { useAutoScrollToBottom } from "./scroll-hooks";

interface RadioModuleProps {
  icon: ReactNode;
  group: number;
  enabled: boolean;
  minimised: boolean;
}

const RadioModule = ({ icon, enabled, minimised }: RadioModuleProps) => {
  const [items, handleSend] = useRadioChatItems();
  const [ref, handleScroll] = useAutoScrollToBottom(items);
  if (minimised) {
    return (
      <HStack spacing={3}>
        {icon}
        <MessageComposer
          enabled={enabled}
          onSend={handleSend}
          minimised={minimised}
        />
      </HStack>
    );
  }
  return (
    <Stack spacing={3} bg="white" borderRadius="md" p={1}>
      <Stack spacing={1} p={1}>
        <VStack
          p={1}
          h="2xs"
          onScroll={handleScroll}
          overflowY="auto"
          scrollBehavior="smooth"
          ref={ref}
        >
          {enabled ? (
            items.map((item) => <ChatItem key={item.id} item={item} />)
          ) : (
            <VStack flex="1 1 auto" justifyContent="center">
              <ChatNotice>
                <FormattedMessage id="simulator-radio-off" />
              </ChatNotice>
            </VStack>
          )}
        </VStack>
        <MessageComposer
          enabled={enabled}
          onSend={handleSend}
          minimised={minimised}
          width="100%"
        />
      </Stack>
    </Stack>
  );
};

const ChatItem = ({ item }: { item: RadioChatItem }) => {
  switch (item.type) {
    case "groupChange":
      return (
        <ChatNotice>
          <FormattedMessage
            id="simulator-radio-group-notice"
            values={{
              groupNumber: item.group,
            }}
          />
        </ChatNotice>
      );
    case "truncationNotice":
      return (
        <ChatNotice>
          <FormattedMessage id="simulator-radio-message-limit-notice" />
        </ChatNotice>
      );
    case "message":
      return <ChatMessage message={item.message} from={item.from} />;
    default:
      throw new Error("Unknown channel item");
  }
};

const ChatNotice = ({ children }: { children: ReactNode }) => (
  <Text color="gray.700" p={1}>
    {children}
  </Text>
);

const ChatUserIcon = ({ color }: { color: string }) => (
  <Icon color={color} h={10} w={10} as={MessageIcon} />
);

const ChatMessage = ({
  from,
  message,
}: {
  from: "code" | "user";
  message: string;
}) => {
  const color = from === "code" ? "blimpTeal.100" : "brand.100";
  return (
    <Flex
      gap="10px"
      flexDirection={from === "code" ? "row" : "row-reverse"}
      alignSelf={from === "code" ? "flex-start" : "flex-end"}
    >
      <ChatUserIcon color={color} />
      <Text bg={color} p={2} borderRadius="md" wordBreak="break-word">
        <VisuallyHidden>
          <FormattedMessage id={`simulator-radio-${from}`} />{" "}
        </VisuallyHidden>
        {message}
      </Text>
    </Flex>
  );
};

interface MessageComposerProps extends BoxProps {
  enabled: boolean;
  minimised: boolean;
  onSend: (message: string) => void;
}

const MessageComposer = ({
  enabled,
  onSend,
  minimised,
  ...props
}: MessageComposerProps) => {
  const intl = useIntl();
  const radioMessageLabel = intl.formatMessage({
    id: "simulator-radio-message",
  });
  const [message, setMessage] = useState<string>("");
  const handleSendMessage = useCallback(
    (e: FormEvent<unknown>) => {
      e.preventDefault();
      onSend(message);
      setMessage("");
    },
    [message, onSend]
  );
  return (
    <HStack
      as="form"
      flex="1 1 auto"
      onSubmit={handleSendMessage}
      spacing={2}
      {...props}
    >
      <Input
        colorScheme="brand"
        minW={0}
        _placeholder={{
          color: "gray.600",
        }}
        borderRadius={minimised ? undefined : "2xl"}
        bgColor="white"
        aria-label={radioMessageLabel}
        type="text"
        placeholder={radioMessageLabel}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        isDisabled={!enabled}
      />
      <IconButton
        icon={<RiSendPlane2Line />}
        isDisabled={!enabled}
        onClick={handleSendMessage}
        aria-label={intl.formatMessage({ id: "simulator-radio-send" })}
      ></IconButton>
    </HStack>
  );
};

export default RadioModule;
