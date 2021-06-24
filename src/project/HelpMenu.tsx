import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  ThemeTypings,
  ThemingProps,
  useDisclosure,
} from "@chakra-ui/react";
import { RiExternalLinkLine, RiQuestionLine } from "react-icons/ri";
import { deployment } from "../deployment";
import AboutDialog from "./AboutDialog";
import { FormattedMessage } from "react-intl";

interface HelpMenuProps extends ThemingProps<"Menu"> {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * A help button that triggers a drop-down menu with actions.
 */
const HelpMenu = ({ size, ...props }: HelpMenuProps) => {
  const aboutDialogDisclosure = useDisclosure();
  return (
    <>
      <AboutDialog
        isOpen={aboutDialogDisclosure.isOpen}
        onClose={aboutDialogDisclosure.onClose}
      />
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
              href="https://microbit-micropython.readthedocs.io/en/v2-docs/"
              target="_blank"
              rel="noopener"
              icon={<RiExternalLinkLine />}
            >
              <FormattedMessage id="documentation" />
            </MenuItem>
            {deployment.supportLink && (
              <MenuItem
                as="a"
                href={deployment.supportLink}
                target="_blank"
                rel="noopener"
                icon={<RiExternalLinkLine />}
              >
                <FormattedMessage id="support" />
              </MenuItem>
            )}
            {deployment.termsOfUseLink && (
              <MenuItem
                as="a"
                href={deployment.termsOfUseLink}
                target="_blank"
                rel="noopener"
                icon={<RiExternalLinkLine />}
              >
                <FormattedMessage id="terms-of-use" />
              </MenuItem>
            )}
            <MenuDivider />
            {/* shift the icon to align with the first line of content */}
            <MenuItem onClick={aboutDialogDisclosure.onOpen}>
              <FormattedMessage id="about" />
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </>
  );
};

export default HelpMenu;
