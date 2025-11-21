import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, VStack, List, ListItem, Heading, Button, ModalFooter } from "@chakra-ui/react";
import { HistoryList } from "./project-history-db";
import { ProjectEntry } from "./project-list-db";
import { useCallback, useEffect, useState } from "react";
import { significantDateUnits } from "./utils";
import { useProjectHistory } from "./project-history-hooks";

interface ProjectHistoryModalProps {
  onLoadRequest: (projectId: string, revisionId: string) => void;
  isOpen: boolean;
  onDismiss: () => void;
  projectInfo: ProjectEntry | null;
}

const ProjectHistoryModal = ({
  onLoadRequest,
  isOpen,
  onDismiss,
  projectInfo,
}: ProjectHistoryModalProps) => {
  const [projectHistoryList, setProjectHistoryList] =
    useState<HistoryList | null>(null);
  const { getHistory, saveRevision } = useProjectHistory();

  const getProjectHistory = useCallback(async () => {
    if (projectInfo === null) {
      setProjectHistoryList(null);
      return;
    }
    const historyList = await getHistory(projectInfo.id);
    setProjectHistoryList(historyList.sort((h) => -h.timestamp));
  }, [getHistory, projectInfo]);

  useEffect(() => {
    void getProjectHistory();
  }, [projectInfo, getProjectHistory]);

  return (
    <Modal isOpen={isOpen && !!projectInfo} onClose={onDismiss}>
      <ModalOverlay />
      <ModalContent maxHeight="80dvh" width="50dvw" maxWidth="unset">
        <ModalHeader>Project history</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto">
          {projectInfo && (
            <VStack>
              <Heading as="h3">{projectInfo.projectName}</Heading>
              <List>
                <ListItem key="projectHead" fontSize="lg" pt={4}>
                  <Heading as="h5">Latest</Heading>
                  <Button
                    onClick={async () => {
                      await saveRevision(projectInfo);
                      await getProjectHistory();
                    }}
                  >
                    Save as new revision
                  </Button>
                </ListItem>
                {projectHistoryList?.map((ph) => (
                  <ListItem key={ph.revisionId} fontSize="lg" pt={4}>
                    <Heading as="h5">
                      Saved on {significantDateUnits(new Date(ph.timestamp))}
                    </Heading>
                    <Button
                      onClick={() => onLoadRequest(ph.projectId, ph.revisionId)}
                    >
                      Load as new project
                    </Button>
                  </ListItem>
                ))}
              </List>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onDismiss}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectHistoryModal;