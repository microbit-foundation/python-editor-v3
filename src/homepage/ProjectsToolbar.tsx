/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  IconButton,
} from "@chakra-ui/react";
import {
  RiCloseLine,
  RiDeleteBin2Line,
  RiEdit2Line,
  RiFileCopyLine,
} from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { ProjectNameDialogReason } from "./project-name";

interface ProjectsToolbarProps extends ButtonGroupProps {
  selectedProjectIds: string[];
  onRenameDuplicateProject: (reason: ProjectNameDialogReason) => void;
  onDeleteProject: () => void;
  onClearSelection: () => void;
  iconOnly?: boolean;
}

const ProjectsToolbar = ({
  selectedProjectIds,
  onRenameDuplicateProject,
  onDeleteProject,
  onClearSelection,
  iconOnly,
  ...rest
}: ProjectsToolbarProps) => {
  const count = selectedProjectIds.length;
  const isSingle = count === 1;
  const intl = useIntl();
  const iconFontSize = iconOnly ? "xl" : undefined;

  return (
    <ButtonGroup
      role="group"
      aria-label={intl.formatMessage({ id: "selection-actions-group" })}
      isAttached
      variant="ghost"
      sx={{
        "& > button": { borderRadius: 0 },
        "& > button + button": {
          borderLeftWidth: "1px",
          borderColor: "gray.200",
        },
      }}
      {...rest}
    >
      {isSingle &&
        (iconOnly ? (
          <IconButton
            onClick={() => onRenameDuplicateProject("rename")}
            icon={<RiEdit2Line />}
            fontSize={iconFontSize}
            aria-label={intl.formatMessage({ id: "rename-project-action" })}
          />
        ) : (
          <Button
            onClick={() => onRenameDuplicateProject("rename")}
            leftIcon={<RiEdit2Line />}
          >
            <FormattedMessage id="rename-project-action" />
          </Button>
        ))}
      {isSingle &&
        (iconOnly ? (
          <IconButton
            onClick={() => onRenameDuplicateProject("duplicate")}
            icon={<RiFileCopyLine />}
            fontSize={iconFontSize}
            aria-label={intl.formatMessage({ id: "duplicate-project-action" })}
          />
        ) : (
          <Button
            onClick={() => onRenameDuplicateProject("duplicate")}
            leftIcon={<RiFileCopyLine />}
          >
            <FormattedMessage id="duplicate-project-action" />
          </Button>
        ))}
      {iconOnly ? (
        <IconButton
          onClick={onDeleteProject}
          icon={<RiDeleteBin2Line />}
          fontSize={iconFontSize}
          aria-label={intl.formatMessage({ id: "delete-project-action" })}
        />
      ) : (
        <Button onClick={onDeleteProject} leftIcon={<RiDeleteBin2Line />}>
          <FormattedMessage id="delete-project-action" />
        </Button>
      )}
      {iconOnly ? (
        <IconButton
          onClick={onClearSelection}
          icon={<RiCloseLine />}
          fontSize={iconFontSize}
          aria-label={intl.formatMessage({ id: "clear" })}
        />
      ) : (
        <Button leftIcon={<RiCloseLine />} onClick={onClearSelection}>
          <FormattedMessage id="clear" />
        </Button>
      )}
    </ButtonGroup>
  );
};

export default ProjectsToolbar;
