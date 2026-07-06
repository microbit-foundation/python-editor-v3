/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 * Modifications (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Card,
  CardBody,
  Icon,
  LinkBox,
  LinkOverlay,
  VStack,
} from "@chakra-ui/react";
import { IconType } from "react-icons/lib";
import { FormattedMessage } from "react-intl";
import { shortScreenHeightBreakpoint } from "./responsive";

interface ActionCardProps {
  onClick: () => void;
  icon: IconType;
  textId: string;
}

/**
 * A large, coloured call-to-action card used in the projects carousel
 * (e.g. "New project", "View all projects").
 */
const ActionCard = ({ onClick, icon, textId }: ActionCardProps) => {
  return (
    <LinkBox h="100%" display="flex">
      <Card
        flexGrow={1}
        overflow="hidden"
        minH="233px"
        sx={{ [shortScreenHeightBreakpoint]: { minH: "160px" } }}
      >
        <CardBody
          display="flex"
          backgroundColor="brand.500"
          color="white"
          sx={{ [shortScreenHeightBreakpoint]: { p: 3 } }}
        >
          <VStack h="100%" w="100%" spacing={0} justifyContent="space-evenly">
            <Icon
              as={icon}
              h={20}
              w={20}
              sx={{ [shortScreenHeightBreakpoint]: { h: 10, w: 10 } }}
            />
            <LinkOverlay
              as={Button}
              h={8}
              fontSize="xl"
              onClick={onClick}
              variant="unstyled"
              _focusVisible={{ boxShadow: "outlineLight", outline: "none" }}
            >
              <FormattedMessage id={textId} />
            </LinkOverlay>
          </VStack>
        </CardBody>
      </Card>
    </LinkBox>
  );
};

export default ActionCard;
