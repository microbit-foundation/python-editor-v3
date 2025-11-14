import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, VStack, Button, ModalFooter, Input } from "@chakra-ui/react";
import { ProjectEntry } from "./project-list-db";
import { useEffect, useState } from "react";

interface ProjectHistoryModalProps {
    handleRename: (projectId: string, projectName: string) => void;
    isOpen: boolean;
    onDismiss: () => void;
    projectInfo: ProjectEntry | null;
}

const RenameProjectModal = ({
    handleRename,
    isOpen,
    onDismiss,
    projectInfo
}: ProjectHistoryModalProps) => {
    const [projectName, setProjectName] = useState<string>(projectInfo?.projectName || "");

    useEffect(() => {
        if (!projectInfo) {
            return;
        }
        setProjectName(projectInfo.projectName);
    }, [projectInfo]);

    return (<Modal
        isOpen={isOpen && !!projectInfo}
        onClose={onDismiss}
      >
        <ModalOverlay />
        <ModalContent maxHeight="80dvh" width="50dvw" maxWidth="unset">
          <ModalHeader>Project history</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {projectInfo && (
            <VStack>
                <Input value={projectName} onChange={e => setProjectName(e.target.value)} />
            </VStack>)}
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onDismiss}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleRename(projectInfo!.id, projectName)}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>)
      }

export default RenameProjectModal;