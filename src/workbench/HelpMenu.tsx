/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
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
import { useCallback, useRef } from "react";
import { MdOutlineCookie } from "react-icons/md";
import {
  RiExternalLinkLine,
  RiFeedbackLine,
  RiInformationLine,
  RiQuestionLine,
} from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { useDialogs } from "../common/use-dialogs";
import { zIndexAboveTerminal } from "../common/zIndex";
import { deployment, useDeployment } from "../deployment";
import AboutDialog from "./AboutDialog/AboutDialog";
import FeedbackForm from "./FeedbackForm";

interface HelpMenuProps extends ThemingProps<"Menu"> {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * A help button that triggers a drop-down menu with actions.
 */
const HelpMenu = ({ size, ...props }: HelpMenuProps) => {
  const aboutDialogDisclosure = useDisclosure();
  const intl = useIntl();
  const dialogs = useDialogs();
  const handleFeedback = useCallback(() => {
    dialogs.show((callback) => (
      <FeedbackForm
        isOpen
        onClose={() => callback(undefined)}
        finalFocusRef={menuButtonRef}
      />
    ));
  }, [dialogs]);
  const { compliance } = useDeployment();
  const handleCookies = useCallback(() => {
    // Only called if defined:
    compliance.manageCookies!();
  }, [compliance]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <AboutDialog
        isOpen={aboutDialogDisclosure.isOpen}
        onClose={aboutDialogDisclosure.onClose}
        finalFocusRef={menuButtonRef}
      />
      <Menu {...props}>
        <MenuButton
          ref={menuButtonRef}
          as={IconButton}
          aria-label={intl.formatMessage({ id: "help" })}
          size={size}
          fontSize="xl"
          variant="sidebar"
          icon={<RiQuestionLine />}
          color="white"
          isRound
        />
        <Portal>
          <MenuList zIndex={zIndexAboveTerminal}>
            {deployment.userGuideLink && (
              <MenuItem
                as="a"
                href={deployment.userGuideLink}
                target="_blank"
                rel="noopener"
                icon={<RiExternalLinkLine />}
              >
                <FormattedMessage id="user-guide" />
              </MenuItem>
            )}
            {deployment.supportLink && (
              <MenuItem
                as="a"
                href={deployment.supportLink}
                target="_blank"
                rel="noopener"
                icon={<RiExternalLinkLine />}
              >
                <FormattedMessage id="help-support" />
              </MenuItem>
            )}
            {deployment.accessibilityLink && (
              <MenuItem
                as="a"
                href={deployment.accessibilityLink}
                target="_blank"
                rel="noopener"
                icon={<RiExternalLinkLine />}
              >
                <FormattedMessage id="accessibility" />
              </MenuItem>
            )}
            <MenuItem
              as="a"
              href="https://microbit-micropython.readthedocs.io/en/v2-docs/"
              target="_blank"
              rel="noopener"
              icon={<RiExternalLinkLine />}
            >
              <FormattedMessage id="micropython-documentation" />
            </MenuItem>
            <MenuItem icon={<RiFeedbackLine />} onClick={handleFeedback}>
              <FormattedMessage id="feedback" />
            </MenuItem>
            <MenuDivider />
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
            {deployment.privacyPolicyLink && (
              <MenuItem
                as="a"
                href={deployment.privacyPolicyLink}
                target="_blank"
                rel="noopener"
                icon={<RiExternalLinkLine />}
              >
                <FormattedMessage id="privacy-policy" />
              </MenuItem>
            )}
            {deployment.compliance.manageCookies && (
              <MenuItem icon={<MdOutlineCookie />} onClick={handleCookies}>
                <FormattedMessage id="cookies-action" />
              </MenuItem>
            )}
            {(deployment.termsOfUseLink ||
              deployment.compliance.manageCookies) && <MenuDivider />}
            <MenuItem
              icon={<RiInformationLine />}
              onClick={aboutDialogDisclosure.onOpen}
            >
              <FormattedMessage id="about" />
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </>
  );
};

export default HelpMenu;
