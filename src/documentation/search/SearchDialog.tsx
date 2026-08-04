/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Divider,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
} from "@microbit/ui";
import { useCallback, useRef } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { Box, Stack } from "styled-system/jsx";
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
      <Box py="1.5" px="1">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <RiSearch2Line />
          </InputLeftElement>
          <Input
            aria-label={intl.formatMessage({ id: "search" })}
            // Chakra's Modal focused the first focusable element on open;
            // react-aria focuses the dialog itself unless told otherwise.
            autoFocus
            ref={ref}
            value={query}
            onChange={onQueryChange}
            type="text"
            css={{
              outline: "none",
              border: "none",
              pl: "10",
              fontSize: "lg",
              // Needs some thought, the default breaks the design.
              "&:is(:focus-visible, [data-focused])": {
                border: "none",
                boxShadow: "none",
              },
              _placeholder: {
                color: "gray.500",
              },
            }}
            placeholder={intl.formatMessage({ id: "search" })}
          />
          {query && (
            <InputRightElement>
              <IconButton
                css={{ fontSize: "2xl", color: "#838383" }}
                variant="ghost"
                aria-label={intl.formatMessage({ id: "clear" })}
                onPress={handleClear}
              >
                <RiCloseLine />
              </IconButton>
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
          mb="1.5"
          overflowX="hidden"
        >
          <Stack gap="5" pb="5">
            <Divider />
            <Text px="3" fontSize="2xl">
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
