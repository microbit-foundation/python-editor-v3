import { Text, VStack } from "@chakra-ui/react";
import { Result } from "./search-hooks";

interface SearchResultListProps {
  title: string;
  results: Result[];
}

const SearchResultList = ({ title, results }: SearchResultListProps) => {
  return (
    <VStack>
      {results.map((result) => (
        <SearchResultItem key={result.id} value={result} />
      ))}
    </VStack>
  );
};

interface SearchResultItemProps {
  value: Result;
}

const SearchResultItem = ({ value }: SearchResultItemProps) => {
  return (
    <VStack>
      <Text>{value.title}</Text>
    </VStack>
  );
};

export default SearchResultList;
