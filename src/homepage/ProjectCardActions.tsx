/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Checkbox,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { MdMoreVert } from "react-icons/md";
import {
  RiDeleteBin2Line,
  RiEdit2Line,
  RiFileCopyLine,
  RiFolderOpenLine,
} from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { ProjectNameDialogReason } from "./project-name";

interface ProjectCardActionsProps {
  id: string;
  name: string;
  isSelected?: boolean;
  onSelected?: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onOpenProject: (id: string) => void;
  onRenameDuplicateProject: (
    reason: ProjectNameDialogReason,
    id: string
  ) => void;
  onSkipToToolbar?: () => void;
}

const ProjectCardActions = ({
  id,
  name,
  isSelected,
  onSelected,
  onDeleteProject,
  onRenameDuplicateProject,
  onOpenProject,
  onSkipToToolbar,
}: ProjectCardActionsProps) => {
  const intl = useIntl();
  const handleRenameProject = useCallback(
    () => onRenameDuplicateProject("rename", id),
    [onRenameDuplicateProject, id]
  );
  const handleDuplicateProject = useCallback(
    () => onRenameDuplicateProject("duplicate", id),
    [onRenameDuplicateProject, id]
  );

  return (
    <HStack
      justifyContent="space-between"
      position="absolute"
      w="100%"
      top={0}
      left={0}
    >
      {onSelected && (
        <Checkbox
          p={5}
          isChecked={isSelected}
          onChange={() => onSelected(id)}
          color="brand.600"
          zIndex={1}
          borderColor="gray.600"
          _hover={{ backgroundColor: "blackAlpha.50" }}
          borderBottomRightRadius="md"
          h="60px"
        >
          <VisuallyHidden>
            <FormattedMessage id="select-project-action" values={{ name }} />
          </VisuallyHidden>
        </Checkbox>
      )}
      {onSkipToToolbar && (
        <Button
          tabIndex={isSelected ? 0 : -1}
          onClick={onSkipToToolbar}
          zIndex={3}
          position="absolute"
          left="50%"
          top={1}
          transform="translateX(-50%)"
          size="xs"
          variant="solid"
          opacity={0}
          pointerEvents="none"
          _focusVisible={{
            opacity: 1,
            pointerEvents: "auto",
            boxShadow: "outline",
          }}
        >
          <FormattedMessage id="project-skip-to-toolbar" />
        </Button>
      )}
      <Menu>
        <MenuButton
          zIndex={1}
          as={IconButton}
          aria-label={intl.formatMessage({ id: "project-menu-action" }, { name })}
          p={5}
          h="100%"
          borderRadius={0}
          borderBottomLeftRadius="md"
          fontSize="xl"
          variant="ghost"
          icon={<MdMoreVert />}
          ml="auto"
        />
        <Portal>
          <MenuList zIndex={1}>
            <MenuItem
              icon={<RiFolderOpenLine />}
              onClick={() => onOpenProject(id)}
            >
              <FormattedMessage id="open-project-action" />
            </MenuItem>
            <MenuItem icon={<RiEdit2Line />} onClick={handleRenameProject}>
              <FormattedMessage id="rename-project-action" />
            </MenuItem>
            <MenuItem icon={<RiFileCopyLine />} onClick={handleDuplicateProject}>
              <FormattedMessage id="duplicate-project-action" />
            </MenuItem>
            <MenuItem
              icon={<RiDeleteBin2Line />}
              onClick={() => onDeleteProject(id)}
            >
              <FormattedMessage id="delete-project-action" />
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </HStack>
  );
};

export default ProjectCardActions;
