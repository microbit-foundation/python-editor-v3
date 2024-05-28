/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Collapse,
  Divider,
  Flex,
  HStack,
  List,
  ListItem,
  Select,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import AreaHeading from "../common/AreaHeading";
import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
import { docStyles } from "../common/documentation-styles";
import { useRouterTabSlug } from "../router-hooks";
import DocumentationHeading from "./common/DocumentationHeading";
import ShowMoreButton from "./common/ShowMoreButton";
import Highlight from "./reference/Highlight";
import CodeEmbed from "./common/CodeEmbed";
import OpenButton from "../project/OpenButton";
import { useModelData } from "./ml/use-model-data";
import { ChangeEvent, useCallback, useState } from "react";

interface ModelTopicEntry {
  name: string;
  text: string;
  code: string | ((actionName: string) => string);
  slug: string;
  detail?: string;
  alternativesLabel?: string;
}

const modelTopicEntries: ModelTopicEntry[] = [
  {
    name: "Class names",
    text: "Return the class names of the current model.",
    code: "import model\n\n\nnamesList = model.get_class_names()",
    slug: "class-names",
  },
  {
    name: "Current action",
    text: "Return the current recognised action.",
    code: "import model\n\n\ndisplay.scroll(model.current_action())",
    slug: "current-action",
  },
  {
    name: "Is action",
    text: "Check if an action is currently being performed.",
    code: (actionName) =>
      `import model\n\n\nwhile True:\n    if model.is_action('${actionName}'):\n        display.scroll('Yes')`,
    slug: "is-action",
    detail: "Triggered on the current recognised action.",
    alternativesLabel: "Select action:",
  },
  {
    name: "Was action",
    text: "Check if an action was performed.",
    code: (actionName) =>
      `import model\n\n\nwhile True:\n    if model.was_action('${actionName}'):\n        display.scroll('Yes')`,
    slug: "was-action",
    detail: "Triggered if the specified action was recognised since last time.",
    alternativesLabel: "Select action:",
  },
];

const ModelArea = () => {
  const [modelData] = useModelData();
  return (
    <HeadedScrollablePanel
      heading={
        <AreaHeading
          name="Machine learning"
          description="Use the machine learning model that was trained"
        />
      }
    >
      <Box
        p={5}
        pb={1}
        fontSize="sm"
        sx={{
          ...docStyles,
        }}
      >
        <Stack spacing={3}>
          <Text>Open your data.json file to get started.</Text>
          <OpenButton alignSelf="flex-start" fileType="mljson" mode="button" />
        </Stack>
      </Box>
      {modelData.length > 0 && (
        <>
          <Box
            p={5}
            pb={1}
            fontSize="sm"
            sx={{
              ...docStyles,
            }}
          >
            <Text>Some optional introduction text</Text>
          </Box>
          <List flex="1 1 auto">
            {modelTopicEntries.map((entry) => (
              <ListItem key={entry.slug}>
                <ModelTopicEntry content={entry} />
                <Divider />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </HeadedScrollablePanel>
  );
};

interface MlItemProps {
  content: ModelTopicEntry;
}

const ModelTopicEntry = ({ content }: MlItemProps) => {
  const { name, text, slug, code, detail, alternativesLabel } = content;
  const hasMore = true;
  const disclosure = useDisclosure();
  const [anchor] = useRouterTabSlug("model");
  const [modelData] = useModelData();
  const [selectedAlternative, setSelectedAlternative] = useState<
    string | undefined
  >(alternativesLabel ? modelData[0].ID.toString() : undefined);
  const [processedCode, setProcessedCode] = useState<string>(() => {
    return typeof code === "string" ? code : code(modelData[0].name);
  });

  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const actionName = modelData.find(
        (action) => action.ID === parseInt(e.currentTarget.value)
      )?.name;
      if (actionName && typeof code === "function") {
        setProcessedCode(code(actionName));
      }
      setSelectedAlternative(e.currentTarget.value);
    },
    [code, modelData]
  );
  return (
    <Highlight
      anchor={anchor}
      id={name}
      active={anchor?.id === slug}
      disclosure={disclosure}
    >
      <Box
        fontSize="sm"
        p={5}
        pr={3}
        mt={1}
        mb={1}
        className="docs-code"
        sx={{
          ...docStyles,
        }}
      >
        <HStack justifyContent="space-between" flexWrap="nowrap">
          <DocumentationHeading name={name} isV2Only={false} />
          {hasMore && (
            <ShowMoreButton
              isBrief
              onClick={disclosure.onToggle}
              isOpen={disclosure.isOpen}
            />
          )}
        </HStack>
        <Stack spacing={3} mt={3}>
          <Text noOfLines={disclosure.isOpen ? undefined : 1}>{text}</Text>
          {alternativesLabel && (
            <Flex wrap="wrap" as="label">
              <Text alignSelf="center" mr={2} as="span">
                {alternativesLabel}
              </Text>
              <Select
                w="fit-content"
                onChange={handleSelectChange}
                value={selectedAlternative}
                size="sm"
              >
                {modelData.map((action) => (
                  <option key={action.ID} value={action.ID}>
                    {action.name}
                  </option>
                ))}
              </Select>
            </Flex>
          )}
          <CodeEmbed
            code={processedCode}
            parentSlug={slug}
            toolkitType="model"
          />
        </Stack>
        {hasMore && (
          <Collapse in={disclosure.isOpen}>
            <Stack
              spacing={3}
              pt={detail ? 3 : 0}
              noOfLines={!disclosure.isOpen ? 1 : undefined}
            >
              <Text>{detail}</Text>
            </Stack>
          </Collapse>
        )}
      </Box>
    </Highlight>
  );
};

export default ModelArea;
