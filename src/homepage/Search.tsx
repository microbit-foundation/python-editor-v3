/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  BoxProps,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { useIntl } from "react-intl";

interface SearchProps extends BoxProps {
  query: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onClear: () => void;
}

const Search = ({
  query,
  onChange: onQueryChange,
  onClear,
  ...rest
}: SearchProps) => {
  const intl = useIntl();
  const ref = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onClear();
    ref.current?.focus();
  }, [onClear]);

  return (
    <InputGroup variant="outline" {...rest}>
      <InputLeftElement pointerEvents="none">
        <RiSearch2Line color="gray.800" />
      </InputLeftElement>
      <Input
        aria-label={intl.formatMessage({ id: "search" })}
        ref={ref}
        value={query}
        onChange={onQueryChange}
        type="text"
        placeholder={intl.formatMessage({ id: "search" })}
        fontSize="lg"
        _placeholder={{ color: "gray.600" }}
        borderRadius="20px"
        background="white"
      />
      {query && (
        <InputRightElement>
          <IconButton
            fontSize="2xl"
            isRound={false}
            variant="ghost"
            aria-label={intl.formatMessage({ id: "clear" })}
            color="#838383"
            icon={<RiCloseLine />}
            onClick={handleClear}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};

export default Search;
