/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { flags } from "../flags";
import { Box, Text } from "@chakra-ui/layout";

interface AreaHeadingProps {
  name: string;
  description: string;
}

const AreaHeading = ({ name, description }: AreaHeadingProps) => (
  <>
    {flags.showAreaHeading ? (
      <Box p={5} pt={3}>
        <Text as="h2" fontSize="3xl" fontWeight="semibold">
          {name}
        </Text>
        <Text fontSize="md">{description} </Text>
      </Box>
    ) : (
      <></>
    )}
  </>
);

export default AreaHeading;
