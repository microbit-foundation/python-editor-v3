/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IconButton,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuTrigger,
} from "@microbit/ui";
import { useCallback, useRef, useState } from "react";
import { MdOutlineCookie } from "react-icons/md";
import {
  RiExternalLinkLine,
  RiFeedbackLine,
  RiInformationLine,
  RiQuestionLine,
} from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { useDialogs } from "../common/use-dialogs";
import { deployment, useDeployment } from "../deployment";
import AboutDialog from "./AboutDialog/AboutDialog";
import FeedbackForm from "./FeedbackForm";

interface HelpMenuProps {
  size?: "lg" | "md" | "sm" | "xs";
}

/**
 * A help button that triggers a drop-down menu with actions.
 */
const HelpMenu = ({ size }: HelpMenuProps) => {
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
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
        isOpen={aboutDialogOpen}
        onClose={() => setAboutDialogOpen(false)}
        finalFocusRef={menuButtonRef}
      />
      <MenuTrigger>
        <IconButton
          ref={menuButtonRef}
          aria-label={intl.formatMessage({ id: "help" })}
          size={size}
          css={{ fontSize: "xl" }}
          variant="sidebar"
        >
          <RiQuestionLine />
        </IconButton>
        <MenuList>
          {deployment.userGuideLink && (
            <MenuItem
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
              href={deployment.accessibilityLink}
              target="_blank"
              rel="noopener"
              icon={<RiExternalLinkLine />}
            >
              <FormattedMessage id="accessibility" />
            </MenuItem>
          )}
          <MenuItem
            href="https://microbit-micropython.readthedocs.io/en/v2-docs/"
            target="_blank"
            rel="noopener"
            icon={<RiExternalLinkLine />}
          >
            <FormattedMessage id="micropython-documentation" />
          </MenuItem>
          <MenuItem icon={<RiFeedbackLine />} onAction={handleFeedback}>
            <FormattedMessage id="feedback" />
          </MenuItem>
          <MenuDivider />
          {deployment.termsOfUseLink && (
            <MenuItem
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
              href={deployment.privacyPolicyLink}
              target="_blank"
              rel="noopener"
              icon={<RiExternalLinkLine />}
            >
              <FormattedMessage id="privacy-policy" />
            </MenuItem>
          )}
          {deployment.compliance.manageCookies && (
            <MenuItem icon={<MdOutlineCookie />} onAction={handleCookies}>
              <FormattedMessage id="cookies-action" />
            </MenuItem>
          )}
          {(deployment.termsOfUseLink ||
            deployment.compliance.manageCookies) && <MenuDivider />}
          <MenuItem
            icon={<RiInformationLine />}
            onAction={() => setAboutDialogOpen(true)}
          >
            <FormattedMessage id="about" />
          </MenuItem>
        </MenuList>
      </MenuTrigger>
    </>
  );
};

export default HelpMenu;
