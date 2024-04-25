import { BoxProps, Image, Text, VStack } from "@chakra-ui/react";
import offlinePlaceholder from "./offline.svg";

interface OfflineImageFallbackProps extends BoxProps {
  useIcon?: boolean;
}

const OfflineImageFallback = ({
  useIcon = false,
  width,
  ...props
}: OfflineImageFallbackProps) => {
  return (
    <>
      {useIcon ? (
        <Image
          fallbackSrc={offlinePlaceholder}
          {...props}
          p={2}
          alt="Image unavailable offline"
        />
      ) : (
        <VStack justifyContent="center" {...props} maxWidth={width}>
          <Text textAlign="center" wordBreak="break-word">
            Image unavailable offline
          </Text>
        </VStack>
      )}
    </>
  );
};

export default OfflineImageFallback;
