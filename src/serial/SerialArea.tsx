/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { backgroundColorTerm } from "../deployment/misc";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { useChatSession, useChatRevealSignal } from "../chat/chat-hooks";
import ChatView from "../chat/ChatView";
import { useLinger } from "../common/use-linger";
import { useConnectionStatus } from "../device/device-hooks";
import { TerminalContext } from "./serial-hooks";
import SerialBar from "./SerialBar";
import XTerm from "./XTerm";

interface SerialAreaProps extends BoxProps {
  compact?: boolean;
  expandDirection: "up" | "down";
  onSizeChange: (size: "compact" | "open") => void;
  showSyncStatus: boolean;
  terminalFontSizePt: number;
  hideExpandTextOnTraceback?: boolean;
  showHintsAndTips?: boolean;
  tabOutRef: HTMLElement;
}

/**
 * The serial area.
 *
 * This is used below the editor (connected via WebUSB) and in the simulator.
 *
 * This has a compact and expanded form and coordinates its
 * size with the workspace layout via compact/onSizeChange.
 */
const SerialArea = ({
  compact,
  onSizeChange,
  showSyncStatus,
  terminalFontSizePt,
  expandDirection,
  hideExpandTextOnTraceback = false,
  showHintsAndTips = true,
  tabOutRef,
  ...props
}: SerialAreaProps) => {
  const status = useConnectionStatus();
  const connected =
    status === ConnectionStatus.Connected || status === ConnectionStatus.Paused;
  const chat = useChatSession();
  // The chat/REPL toggle is sticky: the user's choice persists across
  // program restarts (Ctrl-D / sim reset). We only reset to the chat view
  // when a freshly-flashed program starts a chat.
  const [showTerminal, setShowTerminal] = useState(false);
  const reveal = useChatRevealSignal(chat.active);
  useEffect(() => {
    if (reveal) {
      setShowTerminal(false);
    }
  }, [reveal]);
  // Keep the chat visible for a moment after it goes inactive, so a quick
  // restart (sim reset / Ctrl-D reboot) doesn't flash the raw REPL between
  // the old and new chat. A genuine stop just ends it after this grace.
  const chatVisible = useLinger(chat.active, 500);
  const showChat = chatVisible && !showTerminal && !compact;
  return (
    <TerminalContext>
      <Flex
        {...props}
        flexDirection="column"
        alignItems="stretch"
        height="100%"
        position="relative"
        overflow="hidden"
      >
        {!connected ? null : (
          <Box
            alignItems="stretch"
            backgroundColor={backgroundColorTerm}
            height="100%"
          >
            <SerialBar
              height={12}
              compact={compact}
              onSizeChange={onSizeChange}
              showSyncStatus={showSyncStatus}
              expandDirection={expandDirection}
              hideExpandTextOnTraceback={hideExpandTextOnTraceback}
              showHintsAndTips={showHintsAndTips}
              chatActive={chatVisible && !compact}
              showingChat={showChat}
              onToggleChat={() => setShowTerminal((v) => !v)}
            />
            <Box
              position="relative"
              height={`calc(100% - ${SerialArea.compactSize}px)`}
            >
              {/* The terminal stays mounted (only one instance is
                  supported and we don't want to lose scrollback), so we
                  hide it behind the chat view rather than unmounting. */}
              <XTerm
                visibility={compact || showChat ? "hidden" : undefined}
                height="100%"
                ml={1}
                mr={1}
                fontSizePt={terminalFontSizePt}
                tabOutRef={tabOutRef}
              />
              {showChat && (
                <ChatView
                  chat={chat}
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                />
              )}
            </Box>
          </Box>
        )}
      </Flex>
    </TerminalContext>
  );
};
SerialArea.compactSize = 43.19;
// Height to expand the serial pane to when a chat starts, so the chat
// header, message list and input aren't cramped. Only a starting size -
// the user can still resize or minimise afterwards.
SerialArea.chatExpandSize = 360;

export default SerialArea;
