/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { FormattedMessage, useIntl } from "react-intl";
import { InputDialogBody } from "../common/InputDialog";

const ProjectNameBody = ({
  value,
  setValue,
  validationResult,
}: InputDialogBody<string>) => {
  const intl = useIntl();
  return (
    <FormControl isInvalid={!validationResult.ok}>
      <FormLabel>
        <FormattedMessage id="name-text" />
      </FormLabel>
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={intl.formatMessage({ id: "name-text" })}
      />
    </FormControl>
  );
};

export default ProjectNameBody;
