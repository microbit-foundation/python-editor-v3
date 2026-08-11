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
        // Link-styled button: content-sized, left-aligned, inheriting the
        // surrounding text size. The button recipe's base/size styles
        // (semibold, centred, md height, md font) must all be undone for
        // the link form.
        fontWeight: "normal",
        textAlign: "left",
        justifyContent: "flex-start",
        height: "auto",
        fontSize: "inherit",
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
