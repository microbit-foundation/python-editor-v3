import React, { useCallback } from "react";
import {
  Button,
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
import {
  RiArrowDropDownLine,
  RiExternalLinkLine,
  RiFileCopy2Line,
  RiInformationLine,
} from "react-icons/ri";
import { microPythonVersions } from "../fs/fs";
import Separate from "../common/Separate";
import config from "../config";
import useActionFeedback from "../common/use-action-feedback";

interface HelpMenuProps extends ThemingProps<"Menu"> {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

const versionInfo = [
  `Editor ${process.env.REACT_APP_VERSION}`,
  `MicroPython ${microPythonVersions.map((mpy) => mpy.version).join("/")}`,
];

const openInNewTab = (href: string) => () =>
  window.open(href, "_blank", "noopener");

const handleDocumentation = openInNewTab(config.documentationLink);
const handleSupport = openInNewTab(config.supportLink);

const HelpMenu = ({ size, ...props }: HelpMenuProps) => {
  const actionFeedback = useActionFeedback();
  const handleCopyVersion = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(versionInfo.join("\n"));
    } catch (e) {
      actionFeedback.unexpectedError(e);
    }
  }, [actionFeedback, versionInfo]);

  // TODO: Can we make these actual links and still use the menu components?
  return (
    <Menu {...props}>
      <MenuButton
        as={Button}
        size={size}
        variant="ghost"
        leftIcon={<RiInformationLine />}
        rightIcon={<RiArrowDropDownLine />}
      >
        Help
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem onClick={handleDocumentation} icon={<RiExternalLinkLine />}>
            Documentation
          </MenuItem>
          <MenuItem onClick={handleSupport} icon={<RiExternalLinkLine />}>
            Support
          </MenuItem>
          <MenuDivider />
          {/* shift the icon to align with the first line of content */}
          <MenuItem
            icon={<RiFileCopy2Line style={{ marginTop: "0.5rem" }} />}
            alignItems="top"
            onClick={handleCopyVersion}
          >
            Copy version to clipboard
            <br />
            <Text as="span" fontSize="xs">
              <Separate separator={(key) => <br key={key} />}>
                {versionInfo}
              </Separate>
            </Text>
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default HelpMenu;
