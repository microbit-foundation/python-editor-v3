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
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../../common/GenericDialog";
import connectGifMac from "./connect-mac.gif";
import connectGifWin from "./connect-win.gif";

export const enum ConnectHelpChoice {
  Start,
  StartDontShowAgain,
  Cancel,
}

interface ConnectHelpDialogProps {
  callback: (choice: ConnectHelpChoice) => void;
  dialogNormallyHidden: boolean;
}

const ConnectHelpDialog = ({
  callback,
  dialogNormallyHidden,
}: ConnectHelpDialogProps) => (
  <GenericDialog
    onClose={() => callback(ConnectHelpChoice.Cancel)}
    body={<ConnectHelpDialogBody />}
    footer={
      <ConnectHelpDialogFooter
        onClose={() => callback(ConnectHelpChoice.Cancel)}
        onStart={() => callback(ConnectHelpChoice.Start)}
        onStartDontShowAgain={() =>
          callback(ConnectHelpChoice.StartDontShowAgain)
        }
        dialogNormallyHidden={dialogNormallyHidden}
      />
    }
    size="3xl"
  />
);

const ConnectHelpDialogBody = () => {
  const [isDesktop] = useMediaQuery("(min-width: 768px)");
  const isMac = /Mac/.test(navigator.platform);
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
          height="375px"
          width="389px"
          src={isMac ? connectGifMac : connectGifWin}
          alt=""
          border="1px solid"
          borderColor="gray.600"
        />
        {isDesktop && (
          <List
            position="absolute"
            left="475px"
            top="21px"
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

        <Box position="absolute" top="38px" left="180px">
          {isDesktop && <ArrowOne />}
          {!isDesktop && <Circle text={1} />}
        </Box>
        <Box position="absolute" bottom="45px" left={isMac ? "325px" : "250px"}>
          {isDesktop && isMac && <ArrowTwoMac />}
          {isDesktop && !isMac && <ArrowTwoWin />}
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

interface ConnectHelpDialogFooterProps {
  onClose: () => void;
  onStart: () => void;
  onStartDontShowAgain: () => void;
  dialogNormallyHidden: boolean;
}

const ConnectHelpDialogFooter = ({
  onClose,
  onStart,
  onStartDontShowAgain,
  dialogNormallyHidden,
}: ConnectHelpDialogFooterProps) => {
  return (
    <HStack spacing={2.5} width={dialogNormallyHidden ? "auto" : "100%"}>
      {!dialogNormallyHidden && (
        <Link
          onClick={onStartDontShowAgain}
          as="button"
          color="brand.500"
          mr="auto"
        >
          Don't show this again
        </Link>
      )}
      <Button onClick={onClose} size="lg">
        <FormattedMessage id="cancel-action" />
      </Button>
      <Button onClick={onStart} variant="solid" size="lg">
        <FormattedMessage id="start-action" />
      </Button>
    </HStack>
  );
};

const ArrowOne = () => {
  return (
    <svg
      width="280"
      height="40"
      viewBox="0 0 280 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="35" y="15" width="210" height="10" fill="#7BCDC2" />
      <circle cx="260" cy="20" r="20" fill="#7BCDC2" />
      <path d="M0 19.5L38.25 4.34455V34.6554L0 19.5Z" fill="#7BCDC2" />
      <foreignObject x="240" y="0" width="40" height="40">
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

const ArrowTwoMac = () => {
  return (
    <svg
      width="136"
      height="222"
      viewBox="0 0 136 222"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="13" y="25" width="116" height="10" fill="#7BCDC2" />
      <rect x="13" y="25" width="10" height="170" fill="#7BCDC2" />
      <circle cx="116" cy="30" r="20" fill="#7BCDC2" />
      <path d="M17.5 222L2.34455 183.75H32.6554L17.5 222Z" fill="#7BCDC2" />
      <foreignObject x="96" y="10" width="40" height="40">
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

const ArrowTwoWin = () => {
  return (
    <svg
      width="211"
      height="222"
      viewBox="0 0 211 222"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="13" y="25" width="191" height="10" fill="#7BCDC2" />
      <rect x="13" y="25" width="10" height="170" fill="#7BCDC2" />
      <circle cx="191" cy="30" r="20" fill="#7BCDC2" />
      <path d="M17.5 222L2.34455 183.75H32.6554L17.5 222Z" fill="#7BCDC2" />
      <foreignObject x="171" y="10" width="40" height="40">
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

export default ConnectHelpDialog;
