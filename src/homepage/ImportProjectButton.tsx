/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, IconButton, Input } from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import { RiUpload2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { useImportProject } from "../project/use-import-project";

/**
 * Opens a file picker to import a hex as a new project. Shown as a labelled
 * button on wider screens and an icon-only button on narrow ones.
 */
const ImportProjectButton = () => {
  const intl = useIntl();
  const importProject = useImportProject();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      // Allow re-selecting the same file.
      e.target.value = "";
      if (files.length > 0) {
        void importProject(files, "file-upload");
      }
    },
    [importProject]
  );

  return (
    <>
      <Input
        type="file"
        accept=".hex"
        ref={inputRef}
        onChange={handleChange}
        display="none"
        aria-hidden
      />
      <IconButton
        icon={<RiUpload2Line />}
        onClick={handleClick}
        aria-label={intl.formatMessage({ id: "import-file-action" })}
        variant="ghost"
        display={{ base: "inline-flex", sm: "none" }}
      />
      <Button
        leftIcon={<RiUpload2Line />}
        onClick={handleClick}
        display={{ base: "none", sm: "inline-flex" }}
      >
        <FormattedMessage id="import-file-action" />
      </Button>
    </>
  );
};

export default ImportProjectButton;
