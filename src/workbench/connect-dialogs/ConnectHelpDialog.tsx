/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import {
  Box,
  Flex,
  HStack,
  Image,
  Link,
  List,
  ListItem,
  Text,
  useMediaQuery,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { GenericDialogComponent } from "../../common/GenericDialog";
import { useLocalStorage } from "../../common/use-local-storage";
import { useProjectActions } from "../../project/project-hooks";
import connectGif from "./connect.gif";

interface ConnectHelpDialogProps extends GenericDialogComponent {}

export const ConnectHelpDialogBody = () => {
  const [isDesktop] = useMediaQuery("(min-width: 768px)");
  return (
    <VStack
      width="auto"
      ml="auto"
      mr="auto"
      p={8}
      pt={[5, 5, 8]}
      pb={0}
      spacing={5}
      alignItems="flex-start"
    >
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        Connect your micro:bit
      </Text>
      <Text>
        Connecting lets you send (flash) code directly to your micro:bit, and
        see errors and outputs (expand the ‘serial’ area below your code to see
        them).
      </Text>
      <Box
        position="relative"
        width={isDesktop ? "100%" : "auto"}
        alignSelf={isDesktop ? "" : "center"}
      >
        <Image
          height="456px"
          width="441px"
          src={connectGif}
          alt=""
          border="1px solid #262626"
        />
        {isDesktop && (
          <List
            position="absolute"
            left="515px"
            top="57px"
            alignItems="flex-start"
            spacing={2}
          >
            <ListItem>
              <Flex alignItems="center" height="72px">
                <VisuallyHidden>
                  <Text fontSize="xl">1. </Text>
                </VisuallyHidden>
                <Text fontSize="xl">Choose your micro:bit</Text>
              </Flex>
            </ListItem>
            <ListItem>
              <Flex alignItems="center" height="72px">
                <VisuallyHidden>
                  <Text fontSize="xl">2. </Text>
                </VisuallyHidden>
                <Text fontSize="xl">Select ‘Connect’</Text>
              </Flex>
            </ListItem>
          </List>
        )}

        <Box position="absolute" top="75px" left="201px">
          {isDesktop && <ArrowOne />}
          {!isDesktop && <Circle text={1} />}
        </Box>
        <Box position="absolute" bottom="50px" left="371px">
          {isDesktop && <ArrowTwo />}
          {!isDesktop && <Circle text={2} />}
        </Box>
      </Box>
      {!isDesktop && (
        <List alignSelf="center">
          <ListItem>
            <Text fontSize="xl">1. Choose your micro:bit</Text>
          </ListItem>
          <ListItem>
            <Text fontSize="xl">2. Select ‘Connect’</Text>
          </ListItem>
        </List>
      )}
    </VStack>
  );
};

interface ConnectDialogStorage {
  hidden: boolean;
}

const isConnectDialogStorage = (
  value: unknown
): value is ConnectDialogStorage => {
  return (
    typeof value === "object" && typeof (value as any).hidden === "boolean"
  );
};

export const ConnectHelpDialogFooter = ({
  onClose,
  ignoreLocalStorage,
}: ConnectHelpDialogProps) => {
  const actions = useProjectActions();
  const handleStart = useCallback(async () => {
    onClose();
    await actions.connect();
  }, [actions, onClose]);
  const buttonWidth = "8.1rem";
  const [dialogHidden, setDialogHidden] = useLocalStorage(
    "connect-dialog",
    isConnectDialogStorage,
    { hidden: false }
  );
  const hideDialog = () => {
    onClose();
    setDialogHidden({ hidden: true });
  };
  useEffect(() => {
    if (dialogHidden.hidden && !ignoreLocalStorage) {
      handleStart();
    }
  }, [dialogHidden, handleStart, ignoreLocalStorage]);
  return (
    <HStack spacing={2.5} width={!dialogHidden.hidden ? "100%" : "auto"}>
      {!dialogHidden.hidden && (
        <Link onClick={hideDialog} as="button" color="brand.500" mr="auto">
          Don't show this again
        </Link>
      )}
      <Button onClick={onClose} size="lg" minWidth={buttonWidth}>
        <FormattedMessage id="cancel-action" />
      </Button>
      <Button
        onClick={handleStart}
        variant="solid"
        size="lg"
        minWidth={buttonWidth}
      >
        <FormattedMessage id="start-action" />
      </Button>
    </HStack>
  );
};

const ArrowOne = () => {
  return (
    <svg
      width="300"
      height="40"
      viewBox="0 0 300 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="35" y="15" width="230" height="10" fill="#7BCDC2" />
      <circle cx="280" cy="20" r="20" fill="#7BCDC2" />
      <path d="M0 19.5L38.25 4.34455V34.6554L0 19.5Z" fill="#7BCDC2" />
      <foreignObject x="260" y="0" width="40" height="40">
        <Box
          aria-hidden
          height="40px"
          width="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="2xl" color="white">
            1
          </Text>
        </Box>
      </foreignObject>
    </svg>
  );
};

const ArrowTwo = () => {
  return (
    <svg
      width="135"
      height="262"
      viewBox="0 0 135 262"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="13" y="25" width="89" height="10" fill="#7BCDC2" />
      <rect x="13" y="25" width="10" height="209" fill="#7BCDC2" />
      <circle cx="110" cy="30" r="20" fill="#7BCDC2" />
      <path d="M17.5 262L2.34455 223.75H32.6554L17.5 262Z" fill="#7BCDC2" />
      <foreignObject x="90" y="10" width="40" height="40">
        <Box
          aria-hidden
          height="40px"
          width="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="2xl" color="white">
            2
          </Text>
        </Box>
      </foreignObject>
    </svg>
  );
};

interface CircleProps {
  text: number | string;
}
const Circle = ({ text }: CircleProps) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="20" fill="#7BCDC2" />
      <foreignObject x="0" y="0" width="40" height="40">
        <Box
          aria-hidden
          height="40px"
          width="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="2xl" color="white">
            {text}
          </Text>
        </Box>
      </foreignObject>
    </svg>
  );
};
