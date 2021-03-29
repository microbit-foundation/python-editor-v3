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
import config from "../config";

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
        isRound
      />
      <Portal>
        <MenuList>
          {config.supportedLanguages.map((language) => (
            <MenuItem key={language.id}>{language.name}</MenuItem>
          ))}
          <MenuDivider />
          <MenuItem
            as="a"
            href={config.translationLink}
            target="_blank"
            rel="noopener"
            icon={<RiExternalLinkLine />}
          >
            Help translate
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default LanguageMenu;
