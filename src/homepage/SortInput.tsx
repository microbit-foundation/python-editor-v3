/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ButtonGroup,
  ButtonGroupProps,
  IconButton,
  Select,
} from "@chakra-ui/react";
import { RiArrowDownLine, RiArrowUpLine } from "react-icons/ri";
import { useIntl } from "react-intl";

interface SortInputProps extends ButtonGroupProps {
  value: string;
  onSelectChange: React.ChangeEventHandler<HTMLSelectElement>;
  order: "desc" | "asc";
  toggleOrder: () => void;
  hasSearchQuery: boolean;
}

const SortInput = ({
  value,
  onSelectChange,
  order,
  toggleOrder,
  hasSearchQuery,
  ...rest
}: SortInputProps) => {
  const intl = useIntl();
  return (
    <ButtonGroup isAttached {...rest}>
      <Select
        value={hasSearchQuery ? "relevance" : value}
        onChange={onSelectChange}
        aria-label={intl.formatMessage({ id: "sort-select-label" })}
        fontSize="lg"
        background="white"
        icon={<span />}
        borderBottomRightRadius={0}
        borderTopRightRadius={0}
        _focus={{ zIndex: 1 }}
        isDisabled={hasSearchQuery}
      >
        {hasSearchQuery ? (
          <option value="relevance">
            {intl.formatMessage({ id: "sort-option-relevance" })}
          </option>
        ) : (
          <>
            <option value="name">
              {intl.formatMessage({ id: "sort-option-name" })}
            </option>
            <option value="timestamp">
              {intl.formatMessage({ id: "sort-option-last-modified" })}
            </option>
          </>
        )}
      </Select>
      <IconButton
        borderBottomLeftRadius={0}
        borderTopLeftRadius={0}
        borderBottomRightRadius="md"
        borderTopRightRadius="md"
        background="white"
        fontSize="2xl"
        isRound={false}
        border="1px"
        borderColor="inherit"
        variant="ghost"
        aria-label={intl.formatMessage({
          id:
            hasSearchQuery || order === "desc"
              ? "sort-order-descending-label"
              : "sort-order-ascending-label",
        })}
        color="#838383"
        onClick={toggleOrder}
        isDisabled={hasSearchQuery}
        icon={
          !hasSearchQuery && order === "asc" ? (
            <RiArrowUpLine />
          ) : (
            <RiArrowDownLine />
          )
        }
      />
    </ButtonGroup>
  );
};

export default SortInput;
