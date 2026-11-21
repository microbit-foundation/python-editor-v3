/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Card,
  CardBody,
  darkSurface,
  Icon,
  LinkBox,
  LinkOverlayButton,
  VStack,
} from "@microbit/ui";
import { ReactNode } from "react";
import { IconType } from "react-icons";

interface ActionCardProps {
  onClick: () => void;
  icon: IconType;
  children: ReactNode;
}

/**
 * A card-sized button among the project cards, for creating a project or
 * seeing them all.
 */
const ActionCard = ({ onClick, icon, children }: ActionCardProps) => (
  <LinkBox h="100%" display="flex">
    <Card
      css={{
        flexGrow: 1,
        overflow: "hidden",
        minH: "233px",
        _shortHeight: { minH: "160px" },
      }}
    >
      <CardBody
        {...darkSurface}
        css={{
          display: "flex",
          backgroundColor: "brand.500",
          color: "white",
          _shortHeight: { p: 3 },
        }}
      >
        <VStack h="100%" w="100%" gap={0} justifyContent="space-evenly">
          <Icon
            as={icon}
            css={{
              width: 20,
              height: 20,
              _shortHeight: { width: 10, height: 10 },
            }}
          />
          <LinkOverlayButton onClick={onClick} css={{ h: 8, fontSize: "xl" }}>
            {children}
          </LinkOverlayButton>
        </VStack>
      </CardBody>
    </Card>
  </LinkBox>
);

export default ActionCard;
