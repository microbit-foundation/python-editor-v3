import { Spinner } from "@chakra-ui/spinner";
import { useIntl } from "react-intl";

const ToolkitSpinner = () => {
  const intl = useIntl();
  return (
    <Spinner
      display="block"
      ml="auto"
      mr="auto"
      mt={2}
      label={intl.formatMessage({ id: "loading" })}
    />
  );
};

export default ToolkitSpinner;
