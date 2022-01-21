import { Divider, Link, Stack, Text } from "@chakra-ui/react";
import { useRouterState } from "../router-hooks";
import { Result, Extract } from "./search-hooks";

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
          <ExtractText extract={extract.title} title={true} />
        </Link>
        <ExtractText extract={extract.content} title={false} />
      </Stack>
      <Divider borderWidth="1px" color="gray.400" />
    </Stack>
  );
};

interface ExtractTextProps {
  extract: Extract[];
  title: boolean;
}

const ExtractText = ({ extract, title }: ExtractTextProps) => {
  return (
    <Text
      as={title ? "h3" : "p"}
      fontWeight={title ? "semibold" : "normal"}
      fontSize={title ? "lg" : "sm"}
    >
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
