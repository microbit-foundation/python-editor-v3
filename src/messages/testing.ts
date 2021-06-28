import { IntlShape, MessageDescriptor } from "react-intl";

export const stubIntl = {
  formatMessage: (md: MessageDescriptor) => md.id,
} as IntlShape;
