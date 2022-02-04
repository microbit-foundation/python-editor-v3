import {
  ModalCloseButton as ChakraModalCloseButton,
  CloseButtonProps,
} from "@chakra-ui/react";
import { useIntl } from "react-intl";

const ModalCloseButton = (props: CloseButtonProps) => {
  const intl = useIntl();
  return (
    <ChakraModalCloseButton
      aria-label={intl.formatMessage({ id: "close-action" })}
      {...props}
    />
  );
};

export default ModalCloseButton;
