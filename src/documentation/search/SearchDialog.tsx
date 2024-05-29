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
import { FormattedMessage, useIntl } from "react-intl";
import { RouterState } from "../../router-hooks";
import { SearchResults } from "./common";
import SearchResultList from "./SearchResultList";

interface SearchDialogProps {
  results: SearchResults | undefined;
  query: string;
  onQueryChange: React.ChangeEventHandler<HTMLInputElement>;
  onClear: () => void;
  viewedResults: string[];
  onViewResult: (id: string, navigation: RouterState) => void;
}

const SearchDialog = ({
  results,
  query,
  onQueryChange,
  onClear,
  viewedResults,
  onViewResult,
}: SearchDialogProps) => {
  const intl = useIntl();
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
          <InputLeftElement pointerEvents="none">
            <RiSearch2Line color="gray.800" />
          </InputLeftElement>
          <Input
            aria-label={intl.formatMessage({ id: "search" })}
            ref={ref}
            value={query}
            onChange={onQueryChange}
            type="text"
            outline="none"
            border="none"
            placeholder={intl.formatMessage({ id: "search" })}
            fontSize="lg"
            // Needs some thought, the default breaks the design.
            _focusVisible={{}}
            _placeholder={{
              color: "gray.600",
            }}
          />
          {query && (
            <InputRightElement>
              <IconButton
                fontSize="2xl"
                isRound={false}
                variant="ghost"
                aria-label={intl.formatMessage({ id: "clear" })}
                // Also used for Zoom, move to theme.
                color="#838383"
                icon={<RiCloseLine />}
                onClick={handleClear}
              />
            </InputRightElement>
          )}
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
              <FormattedMessage
                id="results-count"
                values={{
                  count: results.reference.length + results.api.length,
                }}
              />
            </Text>
            <SearchResultList
              title={intl.formatMessage({ id: "reference-tab" })}
              results={results.reference}
              viewedResults={viewedResults}
              onViewResult={onViewResult}
            />
            <SearchResultList
              title={intl.formatMessage({ id: "api-tab" })}
              results={results.api}
              viewedResults={viewedResults}
              onViewResult={onViewResult}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default SearchDialog;
