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
import { FormattedMessage } from "react-intl";
import { Box, Grid, Stack } from "styled-system/jsx";
import { docStylesClass } from "../common/documentation-styles";
import Spinner from "../common/Spinner";
import { useDocumentation } from "../documentation/documentation-hooks";
import DocumentationContent, {
  DocumentationContextProvider,
} from "../documentation/common/DocumentationContent";
import { ideaCode, withoutCode } from "../documentation/ideas/idea-code";
import CodeMirrorView from "../editor/codemirror/CodeMirrorView";
import { useOpenIdea } from "./project-page-actions";

interface IdeaDialogProps {
  slug: string;
  /** The idea's name, shown before its content loads and given to the project. */
  title: string;
  onClose: () => void;
}

/**
 * An idea from the home page: its program beside text explaining it, and a
 * way to open it as a new project.
 */
const IdeaDialog = ({ slug, title, onClose }: IdeaDialogProps) => {
  const { ideas } = useDocumentation();
  const openIdea = useOpenIdea();
  const idea =
    ideas.status === "ok"
      ? ideas.content.find((idea) => idea.slug.current === slug)
      : undefined;
  const code = idea && ideaCode(idea);
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
              <CodeMirrorView value={code} css={{ px: "4", py: "2" }} />
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
          onPress={() => code !== undefined && void openIdea(title, slug, code)}
        >
          <FormattedMessage id="create-project-action" />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default IdeaDialog;
