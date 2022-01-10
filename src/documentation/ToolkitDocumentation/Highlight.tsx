import { Box, BoxProps } from "@chakra-ui/react";

interface HighlightProps extends BoxProps {
  value: boolean;
}

const Highlight = ({ value, children, ...props }: HighlightProps) => {
  const style = value
    ? { backgroundColor: "brand.100" }
    : { transition: "background-color ease-in 0.5s" };
  return (
    <Box {...props} {...style} borderLeftRadius="md">
      {children}
    </Box>
  );
};

export default Highlight;
