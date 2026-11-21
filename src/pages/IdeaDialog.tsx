/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Text,
} from "@microbit/ui";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Box, Grid, Stack } from "styled-system/jsx";
import { docStylesClass } from "../common/documentation-styles";
import Spinner from "../common/Spinner";
import { useDocumentation } from "../documentation/documentation-hooks";
import DocumentationContent, {
  DocumentationContextProvider,
} from "../documentation/common/DocumentationContent";
import { ideaCode, withoutCode } from "../documentation/ideas/idea-code";
import HighlightedCode from "../editor/codemirror/HighlightedCode";
import { useCreateProjectFailure, useOpenIdea } from "./project-page-actions";

interface IdeaDialogProps {
  slug: string;
  /** The idea's name, shown before its content loads and given to the project. */
  title: string;
  onClose: () => void;
}

/**
 * An idea from the home page: text explaining it beside its program, and a
 * way to open it as a new project.
 */
const IdeaDialog = ({ slug, title, onClose }: IdeaDialogProps) => {
  const { ideas } = useDocumentation();
  const openIdea = useOpenIdea();
  // Router state, and so the editor replacing this dialog, renders in a
  // transition that further clicks can delay, so the ref guards the create
  // and local state shows it. Both clear on failure only, to allow a retry.
  const creatingRef = useRef(false);
  const [isCreating, setIsCreating] = useState(false);
  const failure = useCreateProjectFailure();
  useEffect(() => {
    creatingRef.current = false;
    setIsCreating(false);
  }, [failure]);
  const idea =
    ideas.status === "ok"
      ? ideas.content.find((idea) => idea.slug.current === slug)
      : undefined;
  const code = idea && ideaCode(idea);
  const handleCreate = () => {
    if (code === undefined || creatingRef.current) {
      return;
    }
    creatingRef.current = true;
    setIsCreating(true);
    void openIdea(title, slug, code);
  };
  return (
    <Modal isOpen onClose={onClose} size="4xl">
      <ModalCloseButton />
      <ModalHeader level={2} css={{ fontWeight: "bold" }}>
        {title}
      </ModalHeader>
      <ModalBody>
        <Grid columns={{ base: 1, md: 2 }} gap="6" alignItems="start">
          {/* Always rendered, so the code stays in the right-hand column. */}
          <Stack gap="3" fontSize="sm" className={docStylesClass}>
            {idea && (
              // Without the code, which is beside it, and with links to
              // Reference and API as text: they need the editor.
              <DocumentationContextProvider
                parentSlug={idea.slug.current}
                toolkitType="ideas"
                editorLinks={false}
              >
                <DocumentationContent blocks={withoutCode(idea.content)} />
              </DocumentationContextProvider>
            )}
          </Stack>
          <Box
            // As the code examples in Reference and API.
            borderWidth="1px"
            borderColor="blimpTeal.300"
            borderRadius="lg"
            fontFamily="code"
            bgColor="white"
            overflow="auto"
            maxH="60vh"
          >
            {ideas.status === "loading" ? (
              <Spinner />
            ) : code !== undefined ? (
              <HighlightedCode code={code} css={{ px: "4", py: "2" }} />
            ) : (
              <Text p="3">
                <FormattedMessage id="toolkit-error-loading" />
              </Text>
            )}
          </Box>
        </Grid>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          size="lg"
          isDisabled={code === undefined}
          isLoading={isCreating}
          onPress={handleCreate}
        >
          <FormattedMessage id="create-project-action" />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default IdeaDialog;
