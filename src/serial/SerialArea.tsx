/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
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
  Link,
  Text,
} from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";
import { RiErrorWarningLine, RiTerminalBoxLine } from "react-icons/ri";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { backgroundColorTerm } from "../deployment/misc";
import { ConnectionStatus } from "../device/device";
import {
  Traceback,
  useConnectionStatus,
  useDeviceTraceback,
} from "../device/device-hooks";
import { MAIN_FILE } from "../fs/fs";
import { useSelection } from "../workbench/use-selection";
import XTerm from "./XTerm";

interface SerialAreaProps extends BoxProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
}

const SerialArea = ({ compact, onSizeChange, ...props }: SerialAreaProps) => {
  const connected = useConnectionStatus() === ConnectionStatus.CONNECTED;
  return (
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
          spacing={0}
          height="100%"
        >
          <SerialBar
            height={12}
            compact={compact}
            onSizeChange={onSizeChange}
          />
          <XTerm
            visibility={compact ? "hidden" : undefined}
            height="calc(100% - 40px)"
            ml={1}
            mr={1}
          />
        </Box>
      )}
    </Flex>
  );
};

interface SerialBarProps extends BoxProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
}

const SerialBar = ({ compact, onSizeChange, ...props }: SerialBarProps) => {
  const handleExpandCollapseClick = useCallback(() => {
    onSizeChange(compact ? "open" : "compact");
  }, [compact, onSizeChange]);
  return (
    <HStack justifyContent="space-between" p={1} {...props}>
      <SerialIndicators compact={compact} overflow="hidden" />
      <IconButton
        variant="sidebar"
        color="white"
        isRound
        aria-label="Open"
        icon={<ExpandCollapseIcon open={Boolean(compact)} />}
        onClick={handleExpandCollapseClick}
      />
    </HStack>
  );
};

interface SerialIndicatorsProps extends BoxProps {
  compact?: boolean;
}

const SerialIndicators = ({ compact, ...props }: SerialIndicatorsProps) => {
  const traceback = useDeviceTraceback();
  return (
    <HStack {...props}>
      <Icon m={1} as={RiTerminalBoxLine} fill="white" boxSize={5} />
      {compact && (
        <HStack spacing={0}>
          {traceback && (
            <>
              <Icon m={1} as={RiErrorWarningLine} fill="white" boxSize={5} />
              <Text color="white" whiteSpace="nowrap">
                {traceback.error} <MaybeTracebackLink traceback={traceback} />
              </Text>
            </>
          )}
        </HStack>
      )}
    </HStack>
  );
};

interface MaybeTracebackLinkProps {
  traceback: Traceback;
}

const MaybeTracebackLink = ({ traceback }: MaybeTracebackLinkProps) => {
  const { file, line } = traceback;
  if (file === MAIN_FILE && line) {
    return <TracebackLink traceback={traceback}>line {line}</TracebackLink>;
  }
  if (file && line) {
    return (
      <TracebackLink traceback={traceback}>
        {file} line {line}
      </TracebackLink>
    );
  }
  return null;
};

interface TracebackLinkProps {
  traceback: Traceback;
  children: ReactNode;
}

const TracebackLink = ({ traceback, children }: TracebackLinkProps) => {
  const [, setSelection] = useSelection();
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      const { file, line } = traceback;
      if (file) {
        setSelection({
          file,
          location: { line },
        });
      }
    },
    [setSelection, traceback]
  );
  return (
    <Link textDecoration="underline" pl={2} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default SerialArea;
