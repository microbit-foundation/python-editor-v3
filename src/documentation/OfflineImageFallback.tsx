import { BoxProps, Image, Text, VStack } from "@chakra-ui/react";
import offlinePlaceholder from "./offline.svg";
import { FormattedMessage, useIntl } from "react-intl";

interface OfflineImageFallbackProps extends BoxProps {
  useIcon?: boolean;
}

const OfflineImageFallback = ({
  useIcon = false,
  width,
  ...props
}: OfflineImageFallbackProps) => {
  const intl = useIntl();
  return (
    <>
      {useIcon ? (
        <Image
          fallbackSrc={offlinePlaceholder}
          {...props}
          p={2}
          alt={intl.formatMessage({ id: "offline-image-alt" })}
        />
      ) : (
        <VStack justifyContent="center" {...props} maxWidth={width}>
          <Text textAlign="center" wordBreak="break-word">
            <FormattedMessage id="offline-image-alt" />
          </Text>
        </VStack>
      )}
    </>
  );
};

export default OfflineImageFallback;
