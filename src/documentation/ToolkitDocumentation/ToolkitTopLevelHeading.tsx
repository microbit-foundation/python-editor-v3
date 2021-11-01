import { Text } from "@chakra-ui/layout";

interface ToolkitTopLevelHeadingProps {
  name: string;
  description: string;
}

const ToolkitTopLevelHeading = ({
  name,
  description,
}: ToolkitTopLevelHeadingProps) => (
  <>
    <Text as="h2" fontSize="3xl" fontWeight="semibold">
      {name}
    </Text>
    <Text fontSize="sm">{description}</Text>
  </>
);

export default ToolkitTopLevelHeading;
