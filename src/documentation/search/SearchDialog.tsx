/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
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
import { useCallback, useRef } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { SearchResults } from "./common";
import SearchResultList from "./SearchResultList";

interface SearchDialogProps {
  onClose: () => void;
  results: SearchResults | undefined;
  query: string;
  onQueryChange: React.ChangeEventHandler<HTMLInputElement>;
  onClear: () => void;
}

const SearchDialog = ({
  onClose,
  results,
  query,
  onQueryChange,
  onClear,
}: SearchDialogProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const handleClear = useCallback(() => {
    onClear();
    if (ref.current) {
      ref.current.focus();
    }
  }, [onClear]);

  return (
    <Box>
      <Box py={1.5} px={1}>
        <InputGroup variant="outline">
          <InputLeftElement
            pointerEvents="none"
            children={<RiSearch2Line color="gray.800" />}
          />
          <Input
            aria-label="Search"
            ref={ref}
            value={query}
            onChange={onQueryChange}
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

export default SearchDialog;
