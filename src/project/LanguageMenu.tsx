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
} from "@chakra-ui/react";
import { RiEarthLine, RiExternalLinkLine } from "react-icons/ri";
import { supportedLanguages } from "../settings/settings";
import { deployment } from "../deployment";

interface LanguageMenuProps extends ThemingProps<"Menu"> {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * An icon button that triggers a drop-down menu to switch language.
 *
 * This is just a placeholder for now.
 */
const LanguageMenu = ({ size, ...props }: LanguageMenuProps) => {
  return (
    <Menu {...props}>
      <MenuButton
        as={IconButton}
        aria-label="Change language"
        size={size}
        variant="sidebar"
        icon={<RiEarthLine />}
        colorScheme="gray"
        isRound
      />
      <Portal>
        <MenuList>
          {supportedLanguages.map((language) => (
            <MenuItem key={language.id}>{language.name}</MenuItem>
          ))}
          {deployment.translationLink && (
            <>
              <MenuDivider />
              <MenuItem
                as="a"
                href={deployment.translationLink}
                target="_blank"
                rel="noopener"
                icon={<RiExternalLinkLine />}
              >
                Help translate
              </MenuItem>
            </>
          )}
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default LanguageMenu;
