/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Divider, styled, Text } from "@microbit/ui";
import { ComponentProps } from "react";
import { FormattedMessage } from "react-intl";
import { Link as RouterLink } from "react-router";
import { Stack } from "styled-system/jsx";
import { link } from "styled-system/recipes";
import { RouterState } from "../../router-hooks";
import { createEditorUrl } from "../../urls";
import { Extract, Result } from "./common";

// @microbit/ui's Link with react-router underneath, so the href respects the
// basename and a modifier-click opens the result in a new tab.
const Link = styled(RouterLink, link);

interface SearchResultListProps {
  title: string;
  results: Result[];
  viewedResults: string[];
  onViewResult: (id: string, navigation: RouterState) => void;
}

const SearchResultList = ({
  title,
  results,
  viewedResults,
  onViewResult,
}: SearchResultListProps) => {
  return (
    <Stack gap="2">
      <Text as="h2" fontSize="sm" px="3" color="gray.500" fontWeight="bold">
        {title}
      </Text>
      {results.map((result) => (
        <SearchResultItem
          key={result.id}
          value={result}
          viewedResults={viewedResults}
          onViewResult={onViewResult}
        />
      ))}
      {results.length === 0 && (
        <Text fontSize="sm" px="8">
          <FormattedMessage
            id="results-count"
            values={{
              count: results.length,
            }}
          />
        </Text>
      )}
    </Stack>
  );
};

interface SearchResultItemProps {
  value: Result;
  viewedResults: string[];
  onViewResult: (id: string, navigation: RouterState) => void;
}

const SearchResultItem = ({
  value: { extract, navigation, containerTitle, title, id },
  viewedResults,
  onViewResult,
}: SearchResultItemProps) => {
  return (
    <Stack pl="3px" pr="3px">
      <Link
        variant="standalone"
        bgColor={viewedResults.includes(id) ? "#efedf5" : "unset"}
        borderRadius="md"
        to={createEditorUrl(navigation)}
        onClick={(e) => {
          e.preventDefault();
          onViewResult(id, navigation);
        }}
        _hover={{ textDecoration: "none", bgColor: "brand.100" }}
        _focus={{ bgColor: "brand.100" }}
      >
        <Stack px="8" py="2" gap="0">
          {title !== containerTitle && (
            <Text fontSize="sm" color="gray.500" fontWeight="bold">
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
      <Divider thickness="thick" />
    </Stack>
  );
};

interface ExtractTextProps extends ComponentProps<typeof Text> {
  extract: Extract[];
}

const ExtractText = ({ extract, title, ...props }: ExtractTextProps) => {
  return (
    <Text {...props}>
      {extract.map((t, i) =>
        t.type === "text" ? (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- position is the only identity here
          <Text key={i} as="span">
            {t.extract}
          </Text>
        ) : (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- position is the only identity here
          <Text key={i} as="span" bgColor="#6C4BC14D" borderRadius="md" p="0.5">
            {t.extract}
          </Text>
        )
      )}
    </Text>
  );
};

export default SearchResultList;
