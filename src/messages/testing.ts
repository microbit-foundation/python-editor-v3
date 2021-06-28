/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntlShape, MessageDescriptor } from "react-intl";

export const stubIntl = {
  formatMessage: (md: MessageDescriptor) => md.id,
} as IntlShape;
