/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@microbit/ui";
import { FormattedMessage } from "react-intl";
import ExpandCollapseIcon from "../../common/ExpandCollapseIcon";

interface ShowMoreButtonProps {
  onClick: () => void;
  isOpen: boolean;
  isBrief?: boolean;
}

const ShowMoreButton = ({ isOpen, isBrief, onClick }: ShowMoreButtonProps) => {
  const more = isBrief ? "more-action" : "show-more";
  const less = isBrief ? "less-action" : "show-less";
  return (
    <Button
      variant="unstyled"
      onPress={onClick}
      css={{
        color: "brand.600",
        // The Chakra version was a Link (weight inherited as normal); the
        // button recipe base is semibold.
        fontWeight: "normal",
        textAlign: "left",
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <FormattedMessage id={isOpen ? less : more} />
      <ExpandCollapseIcon open={isOpen} css={{ ml: "1" }} />
    </Button>
  );
};

export default ShowMoreButton;
