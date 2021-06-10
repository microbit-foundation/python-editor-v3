import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Text,
  ThemeTypings,
  ThemingProps,
} from "@chakra-ui/react";
import React, { useCallback } from "react";
import {
  RiExternalLinkLine,
  RiFileCopy2Line,
  RiQuestionLine,
} from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import Separate, { br } from "../common/Separate";
import useActionFeedback from "../common/use-action-feedback";
import config from "../config";
import { microPythonVersions } from "../fs/micropython";

interface HelpMenuProps extends ThemingProps<"Menu"> {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

const versionInfo = [
  `Editor ${process.env.REACT_APP_VERSION}`,
  `MicroPython ${microPythonVersions.map((mpy) => mpy.version).join("/")}`,
];

/**
 * A help button that triggers a drop-down menu with actions.
 */
const HelpMenu = ({ size, ...props }: HelpMenuProps) => {
  const actionFeedback = useActionFeedback();
  const handleCopyVersion = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(versionInfo.join("\n"));
    } catch (e) {
      actionFeedback.unexpectedError(e);
    }
  }, [actionFeedback]);

  return (
    <Menu {...props}>
      <MenuButton
        as={IconButton}
        aria-label="Help"
        size={size}
        variant="sidebar"
        icon={<RiQuestionLine />}
        colorScheme="gray"
        isRound
      />
      <Portal>
        <MenuList>
          <MenuItem
            as="a"
            href={config.documentationLink}
            target="_blank"
            rel="noopener"
            icon={<RiExternalLinkLine />}
          >
            <FormattedMessage id="documentation" />
          </MenuItem>
          <MenuItem
            as="a"
            href={config.supportLink}
            target="_blank"
            rel="noopener"
            icon={<RiExternalLinkLine />}
          >
            <FormattedMessage id="support" />
          </MenuItem>
          <MenuItem
            as="a"
            href={config.termsOfUseLink}
            target="_blank"
            rel="noopener"
            icon={<RiExternalLinkLine />}
          >
            <FormattedMessage id="terms-of-use" />
          </MenuItem>
          <MenuDivider />
          {/* shift the icon to align with the first line of content */}
          <MenuItem
            icon={<RiFileCopy2Line style={{ marginTop: "0.5rem" }} />}
            alignItems="top"
            onClick={handleCopyVersion}
          >
            <FormattedMessage id="copy-clipboard" />
            <br />
            <Text as="span" fontSize="xs">
              <Separate separator={br}>{versionInfo}</Separate>
            </Text>
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default HelpMenu;
