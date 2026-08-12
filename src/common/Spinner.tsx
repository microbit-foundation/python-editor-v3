/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Spinner as UiSpinner } from "@microbit/ui";
import { useIntl } from "react-intl";
import { Box } from "styled-system/jsx";

const Spinner = () => {
  const intl = useIntl();
  return (
    <Box height="100%">
      <UiSpinner
        css={{ display: "block", ml: "auto", mr: "auto", mt: "2" }}
        aria-label={intl.formatMessage({ id: "loading" })}
      />
    </Box>
  );
};

export default Spinner;
