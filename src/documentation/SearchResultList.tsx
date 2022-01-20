import { Divider, Link, Stack, Text } from "@chakra-ui/react";
import { useRouterState } from "../router-hooks";
import { Result } from "./search-hooks";

interface SearchResultListProps {
  title: string;
  results: Result[];
  onClose: () => void;
}

const SearchResultList = ({
  title,
  results,
  onClose,
}: SearchResultListProps) => {
  return (
    <Stack spacing={2}>
      <Text as="h2" fontSize="sm" px={3} color="gray.600" fontWeight="bold">
        {title}
      </Text>
      {results.map((result) => (
        <SearchResultItem key={result.id} value={result} onClose={onClose} />
      ))}
      {results.length === 0 && (
        <Text as="h2" fontSize="sm" px={8}>
          No results
        </Text>
      )}
    </Stack>
  );
};

interface SearchResultItemProps {
  value: Result;
  onClose: () => void;
}

const SearchResultItem = ({
  value: { extract, navigation, containerTitle, title },
  onClose,
}: SearchResultItemProps) => {
  const [, setState] = useRouterState();
  return (
    <Stack>
      <Stack px={8} py={2} spacing={0}>
        {title !== containerTitle && (
          <Text fontSize="sm" color="gray.600" fontWeight="bold">
            {containerTitle}
          </Text>
        )}
        <Link
          onClick={(e) => {
            e.preventDefault();
            onClose();
            setState(navigation);
          }}
        >
          <Text as="h3" fontWeight="semibold" fontSize="lg">
            {title}
          </Text>
        </Link>
        <Text fontSize="sm">
          {extract ??
            // Temporary for the benefit of the design.
            "Turning and turning in the widening gyre / The falcon cannot hear the falconer / Things fall apart; the centre cannot hold"}
        </Text>
      </Stack>
      <Divider />
    </Stack>
  );
};

export default SearchResultList;
