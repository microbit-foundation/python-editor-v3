/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Divider, Link, Stack, Text, TextProps } from "@chakra-ui/react";
import { getQueryString, useRouterState } from "../../router-hooks";
import { Extract, Result } from "./common";

interface SearchResultListProps {
  title: string;
  results: Result[];
  onClose: () => void;
  viewedResults: string[];
  onViewResult: (id: string) => void;
}

const SearchResultList = ({
  title,
  results,
  onClose,
  viewedResults,
  onViewResult,
}: SearchResultListProps) => {
  return (
    <Stack spacing={2}>
      <Text as="h2" fontSize="sm" px={3} color="gray.600" fontWeight="bold">
        {title}
      </Text>
      {results.map((result) => (
        <SearchResultItem
          key={result.id}
          value={result}
          onClose={onClose}
          viewedResults={viewedResults}
          onViewResult={onViewResult}
        />
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
  viewedResults: string[];
  onViewResult: (id: string) => void;
}

const SearchResultItem = ({
  value: { extract, navigation, containerTitle, title, id },
  onClose,
  viewedResults,
  onViewResult,
}: SearchResultItemProps) => {
  const [, setState] = useRouterState();
  const query = getQueryString(navigation);
  const url =
    window.location.toString().split("?")[0] + (query ? "?" + query : "");

  //#efedf5 or #f8f6fc for viewed
  return (
    <Stack pl="3px" pr="3px">
      <Link
        bgColor={viewedResults.includes(id) ? "#efedf5" : "unset"}
        borderRadius="md"
        href={url}
        onClick={(e) => {
          e.preventDefault();
          onClose();
          setState(navigation);
          onViewResult(id);
        }}
        _hover={{ textDecor: "none", bgColor: "brand.100" }}
        _focus={{ bgColor: "brand.100" }}
      >
        <Stack px={8} py={2} spacing={0}>
          {title !== containerTitle && (
            <Text fontSize="sm" color="gray.600" fontWeight="bold">
              {containerTitle}
            </Text>
          )}
          <ExtractText
            extract={extract.title}
            as="h3"
            fontWeight="semibold"
            fontSize="lg"
          />
          <ExtractText extract={extract.content} />
        </Stack>
      </Link>
      <Divider borderWidth="1px" color="gray.400" />
    </Stack>
  );
};

interface ExtractTextProps extends TextProps {
  extract: Extract[];
}

const ExtractText = ({ extract, title, ...props }: ExtractTextProps) => {
  return (
    <Text {...props}>
      {extract.map((t, i) =>
        t.type === "text" ? (
          <Text key={i} as="span">
            {t.extract}
          </Text>
        ) : (
          <Text key={i} as="span" bgColor="#6C4BC14D" borderRadius="md" p={0.5}>
            {t.extract}
          </Text>
        )
      )}
    </Text>
  );
};

export default SearchResultList;
