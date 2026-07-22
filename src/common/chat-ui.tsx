/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, Icon, Text, VisuallyHidden } from "@chakra-ui/react";
import { ElementType, ReactNode } from "react";

/**
 * Shared chat message components.
 *
 * Used by the simulator radio module and the serial chat so the two read
 * as one system. Colours and the avatar icon are passed in so the same
 * components work on the radio module's light card and the serial area's
 * dark background.
 */

export interface ChatMessageBubbleProps {
  /** "code" is the program side (left), "user" is the person (right). */
  from: "code" | "user";
  /** Visually-hidden sender label announced to screen readers. */
  label: ReactNode;
  /** Face avatar shown beside the bubble. Omit for no avatar. */
  iconAs?: ElementType;
  iconColor?: string;
  bubbleBg: string;
  bubbleColor?: string;
  /** Optionally limit the bubble width (e.g. "80%"). */
  maxW?: string;
  children: ReactNode;
}

export const ChatMessageBubble = ({
  from,
  label,
  iconAs,
  iconColor,
  bubbleBg,
  bubbleColor = "black",
  maxW,
  children,
}: ChatMessageBubbleProps) => (
  <Flex
    gap="10px"
    maxW={maxW}
    flexDirection={from === "code" ? "row" : "row-reverse"}
    alignSelf={from === "code" ? "flex-start" : "flex-end"}
  >
    {iconAs && <Icon color={iconColor} h={10} w={10} as={iconAs} flexShrink={0} />}
    <Text
      bg={bubbleBg}
      color={bubbleColor}
      p={2}
      borderRadius="md"
      wordBreak="break-word"
      whiteSpace="pre-wrap"
    >
      <VisuallyHidden>{label} </VisuallyHidden>
      {children}
    </Text>
  </Flex>
);

export const ChatNotice = ({
  children,
  color = "gray.700",
}: {
  children: ReactNode;
  color?: string;
}) => (
  <Text color={color} p={1}>
    {children}
  </Text>
);
