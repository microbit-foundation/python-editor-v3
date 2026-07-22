/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  BoxProps,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { RiSendPlane2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { ChatMessageBubble } from "../common/chat-ui";
import { useAutoScrollToBottom } from "../common/use-auto-scroll-to-bottom";
import { backgroundColorTerm } from "../deployment/misc";
import MessageIcon from "../simulator/icons/microbit-face-icon.svg?react";
import { ChatMessage, ChatSession } from "./chat-hooks";

interface ChatViewProps extends BoxProps {
  chat: ChatSession;
}

/**
 * A chat-style view of the serial connection, shown in place of the REPL
 * while a microchat program is running. The toggle back to the raw REPL
 * lives in the serial header (SerialBar).
 *
 * Shares its message components with the simulator radio module (see
 * common/chat-ui) but stays on the dark serial background.
 */
const ChatView = ({ chat, ...props }: ChatViewProps) => {
  const intl = useIntl();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [scrollRef, handleScroll] = useAutoScrollToBottom(chat.messages);

  // Focus the input when the chat opens.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (e: FormEvent<unknown>) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }
    chat.send(text);
    setDraft("");
  };

  const messageLabel = intl.formatMessage({ id: "chat-message" });
  return (
    <Flex
      {...props}
      direction="column"
      backgroundColor={backgroundColorTerm}
      color="white"
    >
      <HStack
        px={3}
        py={2}
        borderBottomWidth={1}
        borderColor="whiteAlpha.300"
        flex="0 0 auto"
      >
        <Text fontWeight="semibold" isTruncated>
          {chat.botName}
        </Text>
      </HStack>
      <VStack
        ref={scrollRef}
        onScroll={handleScroll}
        flex="1 1 auto"
        overflowY="auto"
        align="stretch"
        spacing={3}
        px={3}
        py={3}
      >
        {chat.messages.map((m) => (
          <ChatBubble key={m.id} message={m} botName={chat.botName} />
        ))}
      </VStack>
      <HStack
        as="form"
        flex="0 0 auto"
        px={3}
        py={3}
        spacing={2}
        borderTopWidth={1}
        borderColor="whiteAlpha.300"
        onSubmit={submit}
      >
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={messageLabel}
          aria-label={messageLabel}
          borderRadius="2xl"
          backgroundColor="whiteAlpha.100"
          borderColor="whiteAlpha.300"
          _hover={{ borderColor: "whiteAlpha.400" }}
          color="white"
          _placeholder={{ color: "whiteAlpha.600" }}
        />
        <IconButton
          type="submit"
          colorScheme="blue"
          icon={<RiSendPlane2Line />}
          aria-label={intl.formatMessage({ id: "chat-send" })}
        />
      </HStack>
    </Flex>
  );
};

const ChatBubble = ({
  message,
  botName,
}: {
  message: ChatMessage;
  botName: string;
}) => {
  const intl = useIntl();
  const isBot = message.from === "bot";
  return (
    <ChatMessageBubble
      from={isBot ? "code" : "user"}
      // The bot has a face; the user doesn't need to see their own avatar.
      iconAs={isBot ? MessageIcon : undefined}
      iconColor={isBot ? "blimpTeal.300" : undefined}
      bubbleBg={isBot ? "whiteAlpha.300" : "blue.500"}
      bubbleColor="white"
      maxW="80%"
      label={isBot ? botName : intl.formatMessage({ id: "chat-you" })}
    >
      {message.text}
    </ChatMessageBubble>
  );
};

export default ChatView;
