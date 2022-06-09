import { Box } from "@chakra-ui/react";
import { zIndexOverlay } from "../../common/zIndex";

const Overlay = () => {
  return (
    <Box
      width="100vw"
      height="100vh"
      background="var(--chakra-colors-blackAlpha-600)"
      position="fixed"
      top={0}
      left={0}
      zIndex={zIndexOverlay}
    />
  );
};

export default Overlay;
