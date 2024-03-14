/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Flex,
  Image,
  List,
  ListItem,
  Text,
  useMediaQuery,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { FormattedMessage, useIntl } from "react-intl";
import selectMicrobit from "./select-microbit.png";

const ConnectHelpDialogBody = () => {
  const intl = useIntl();
  const [isDesktop] = useMediaQuery("(min-width: 768px)", { ssr: false });
  return (
    <VStack
      width="auto"
      ml="auto"
      mr="auto"
      p={5}
      pb={0}
      spacing={5}
      alignItems="flex-start"
    >
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        <FormattedMessage id="connect-help-title" />
      </Text>
      <Box
        position="relative"
        width={isDesktop ? "100%" : "auto"}
        alignSelf={isDesktop ? "" : "center"}
      >
        <Image
          height={375}
          width={418}
          src={selectMicrobit}
          alt={intl.formatMessage({ id: "connect-help-alt" })}
        />
        {isDesktop && (
          <>
            <Text
              position="absolute"
              as="h3"
              fontWeight="semibold"
              left="442px"
              top="0px"
              fontSize="xl"
            >
              <FormattedMessage id="connect-help-message" />
            </Text>
            <List
              position="absolute"
              left="495px"
              top="61px"
              alignItems="flex-start"
              spacing={2}
            >
              <ListItem>
                <Flex alignItems="center" height="72px">
                  <VisuallyHidden>
                    <Text fontSize="xl">1. </Text>
                  </VisuallyHidden>
                  <Text fontSize="xl">
                    {" "}
                    <FormattedMessage id="connect-help-one" />
                  </Text>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex alignItems="center" height="72px">
                  <VisuallyHidden>
                    <Text fontSize="xl">2. </Text>
                  </VisuallyHidden>
                  <Text fontSize="xl">
                    <FormattedMessage id="connect-help-two" />
                  </Text>
                </Flex>
              </ListItem>
            </List>
          </>
        )}

        <Box position="absolute" top="81px" left="230px">
          {isDesktop && <ArrowOne />}
          {!isDesktop && <Circle text={1} />}
        </Box>
        <Box position="absolute" bottom="48px" left="347px">
          {isDesktop && <ArrowTwo />}
          {!isDesktop && <Circle text={2} />}
        </Box>
      </Box>
      {!isDesktop && (
        <List alignSelf="center">
          <ListItem>
            <Text fontSize="xl">
              1. <FormattedMessage id="connect-help-one" />
            </Text>
          </ListItem>
          <ListItem>
            <Text fontSize="xl">
              2. <FormattedMessage id="connect-help-two" />
            </Text>
          </ListItem>
        </List>
      )}
    </VStack>
  );
};

const ArrowOne = () => {
  return (
    <svg
      width="250"
      height="40"
      viewBox="0 0 250 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="35" y="15" width="180" height="10" fill="#7BCDC2" />
      <circle cx="230" cy="20" r="20" fill="#7BCDC2" />
      <path d="M0 19.5L38.25 4.34455V34.6554L0 19.5Z" fill="#7BCDC2" />
      <foreignObject x="210" y="0" width="40" height="40">
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
      width="133"
      height="180"
      viewBox="0 0 133 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="13" y="25" width="113" height="10" fill="#7BCDC2" />
      <rect x="13" y="25" width="10" height="140" fill="#7BCDC2" />
      <circle cx="113" cy="30" r="20" fill="#7BCDC2" />
      <path d="M17.5 180L2.34455 143.75H32.6554L17.5 180Z" fill="#7BCDC2" />
      <foreignObject x="93" y="10" width="40" height="40">
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

export default ConnectHelpDialogBody;
