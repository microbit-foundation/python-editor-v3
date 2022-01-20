import {
  Box,
  Divider,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { SearchResults, useSearch } from "./search-hooks";
import SearchResultList from "./SearchResultList";

interface SearchProps {
  onClose: () => void;
}

const Search = ({ onClose }: SearchProps) => {
  const search = useSearch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | undefined>();
  const ref = useRef<HTMLInputElement>(null);

  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        const newQuery = e.currentTarget.value;
        setQuery(newQuery);
        setResults(search.search(newQuery));
      },
      [search]
    );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults(undefined);
    if (ref.current) {
      ref.current.focus();
    }
  }, [setQuery, setResults]);

  return (
    <Box>
      <Box py={2} px={1}>
        <InputGroup variant="outline">
          <InputLeftElement
            pointerEvents="none"
            children={<RiSearch2Line color="gray.800" />}
          />
          <Input
            ref={ref}
            value={query}
            onChange={handleQueryChange}
            type="text"
            outline="none"
            border="none"
            placeholder="Documentation search"
            fontSize="lg"
            // Needs some thought, the default breaks the design.
            _focus={{}}
            _placeholder={{
              color: "gray.600",
            }}
          />
          <InputRightElement>
            <IconButton
              fontSize="2xl"
              isRound={false}
              variant="ghost"
              aria-label="Clear"
              // Also used for Zoom, move to theme.
              color="#838383"
              icon={<RiCloseLine />}
              onClick={handleClear}
            />
          </InputRightElement>
        </InputGroup>
      </Box>
      {results && (
        <Box
          height="auto"
          maxHeight="80vh"
          overflowY="auto"
          // Avoid scrollbar outside rounded corner.
          mb={1.5}
          overflowX="hidden"
        >
          <Stack spacing={5} pb={5}>
            <Divider />
            <Text px={3} fontSize="2xl">
              {results.explore.length + results.reference.length} results
            </Text>
            <SearchResultList
              title="Explore"
              results={results.explore}
              onClose={onClose}
            />
            <SearchResultList
              title="Reference"
              results={results.reference}
              onClose={onClose}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Search;
