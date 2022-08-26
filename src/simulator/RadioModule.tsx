/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
  usePrevious,
  VStack,
} from "@chakra-ui/react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { RiSendPlane2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { useSimulator } from "../device/device-hooks";
import { EVENT_RADIO_DATA, EVENT_RADIO_RESET } from "../device/simulator";
import { ReactComponent as MessageIcon } from "./icons/microbit-face-icon.svg";

export interface RadioMessage {
  type: "message";
  id: number | string;
  from: "user" | "code";
  message: string;
}

export interface RadioGroupChange {
  type: "groupChange";
  id: number | string;
  group: number;
}

export interface TruncationNotice {
  type: "truncationNotice";
  id: "truncationNotice";
}

export type RadioChatItem = RadioGroupChange | RadioMessage | TruncationNotice;

const messageLimit = 100;
let idSeq = 0;

interface RadioModuleProps {
  icon: ReactNode;
  group: number;
  enabled: boolean;
  minimised: boolean;
}

const RadioModule = ({ icon, enabled, group, minimised }: RadioModuleProps) => {
  const [items, setItems] = useState<RadioChatItem[]>([]);
  const device = useSimulator();
  const prevGroup = usePrevious(group);
  useEffect(() => {
    if (group !== prevGroup) {
      setItems((items) =>
        cappedMessages([...items, { type: "groupChange", group, id: idSeq++ }])
      );
    }
  }, [group, prevGroup]);

  useEffect(() => {
    const handleReceive = (message: string) => {
      setItems((items) =>
        cappedMessages([
          ...items,
          { type: "message", from: "code", message, id: idSeq++ },
        ])
      );
    };
    const handleReset = () => {
      setItems([{ type: "groupChange", group, id: idSeq++ }]);
    };
    device.on(EVENT_RADIO_DATA, handleReceive);
    device.on(EVENT_RADIO_RESET, handleReset);
    return () => {
      device.removeListener(EVENT_RADIO_RESET, handleReset);
      device.removeListener(EVENT_RADIO_DATA, handleReceive);
    };
  }, [device, group]);
  const handleSend = useCallback(
    (message: string) => {
      setItems((items) =>
        cappedMessages([
          ...items,
          { type: "message", from: "user", message, id: idSeq++ },
        ])
      );
      device.radioSend(message);
    },
    [device]
  );

  const [scrollToBottom, setScrollToBottom] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(
    (e: React.UIEvent) => {
      const isAtBottom =
        ref.current!.scrollTop ===
        ref.current!.scrollHeight - ref.current!.offsetHeight;
      setScrollToBottom(isAtBottom);
    },
    [ref, setScrollToBottom]
  );
  useEffect(() => {
    if (scrollToBottom && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [scrollToBottom, items]);
  return (
    <HStack pb={minimised ? 0 : 2} pt={0} spacing={3}>
      {minimised ? (
        <>
          {icon}
          <MessageComposer
            enabled={enabled}
            onSend={handleSend}
            minimised={minimised}
          />
        </>
      ) : (
        <Stack spacing={3} width="100%" bg="white" borderRadius="md" p={1}>
          <Stack spacing={1} p={1}>
            <VStack
              p={1}
              width="100%"
              h="2xs"
              onScroll={handleScroll}
              overflowY="auto"
              scrollBehavior="smooth"
              ref={ref}
            >
              {items.map((item) => (
                <ChatItem key={item.id} item={item} />
              ))}
            </VStack>
            <MessageComposer
              enabled={enabled}
              onSend={handleSend}
              minimised={minimised}
              width="100%"
            />
          </Stack>
        </Stack>
      )}
    </HStack>
  );
};

const ChatItem = ({ item }: { item: RadioChatItem }) => {
  switch (item.type) {
    case "groupChange":
      return <ChatNotice>Radio group set to {item.group}</ChatNotice>;
    case "truncationNotice":
      return (
        <ChatNotice>
          <FormattedMessage id="simulator-radio-message-limit" />
        </ChatNotice>
      );
    case "message":
      return <ChatMessage message={item.message} from={item.from} />;
    default:
      throw new Error("Unknown channel item");
  }
};

const ChatNotice = ({ children }: { children: ReactNode }) => (
  <Text color="gray.700" opacity="80%" p={1}>
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
      <Box bg={color} p={2} borderRadius="md" wordBreak="break-word">
        {message}
      </Box>
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
    <HStack
      as="form"
      flex="1 1 auto"
      onSubmit={handleSendMessage}
      spacing={2}
      {...props}
    >
      <Input
        minW={0}
        borderRadius={minimised ? undefined : "2xl"}
        border={minimised ? undefined : "none"}
        bgColor={minimised ? undefined : "gray.25"}
        aria-label="Radio message to send"
        type="text"
        placeholder="Send a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={!enabled}
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

// Exposed for testing
export const cappedMessages = (
  items: RadioChatItem[],
  limit: number = messageLimit
): RadioChatItem[] => {
  // Find the first message that we keep.
  let firstKeptMessageIndex = 0;
  let count = 0;
  for (let i = items.length - 1; i >= 0; --i) {
    if (items[i].type === "message") {
      count++;
      firstKeptMessageIndex = i;
      if (count === limit) {
        break;
      }
    }
  }
  const result: RadioChatItem[] = [];
  let truncated: boolean = false;
  items.forEach((item, index) => {
    switch (item.type) {
      case "message": {
        if (index === firstKeptMessageIndex && truncated) {
          result.push({ type: "truncationNotice", id: "truncationNotice" });
        }
        if (index >= firstKeptMessageIndex) {
          result.push(item);
        } else {
          truncated = true;
        }
        break;
      }
      case "truncationNotice": {
        // Skip it, we'll add a new one if required.
        break;
      }
      default: {
        result.push(item);
        break;
      }
    }
  });
  return result;
};

export default RadioModule;
