import { Divider, Link, Stack, Text, TextProps } from "@chakra-ui/react";
import { useRouterState } from "../../router-hooks";
import { Extract } from "./extracts";
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
          <ExtractText
            extract={extract.title}
            as="h3"
            fontWeight="semibold"
            fontSize="lg"
          />
        </Link>
        <ExtractText extract={extract.content} />
      </Stack>
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
