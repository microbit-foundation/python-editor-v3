/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  BoxProps,
  Button,
  Flex,
  Icon,
  IconButton,
  useMediaQuery,
} from "@chakra-ui/react";
import { RiPlayCircleFill, RiPlayCircleLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { widthXl } from "../common/media-queries";
import { topBarHeight } from "../deployment/misc";
import ZoomControls from "../editor/ZoomControls";
import { flags } from "../flags";
import ProjectNameEditable from "../project/ProjectNameEditable";
import { WorkbenchSelection } from "../workbench/use-selection";
import ActiveFileInfo from "./ActiveFileInfo";
import EditorContainer from "./EditorContainer";
import { ReactComponent as MicrobitBoard } from "./microbit-drawing.svg";
import { ReactComponent as FaceIcon } from "./microbit-face-icon.svg";
import UndoRedoControls from "./UndoRedoControls";

interface EditorAreaProps extends BoxProps {
  selection: WorkbenchSelection;
  onSelectedFileChanged: (filename: string) => void;
  simulatorShown: boolean;
  setSimulatorShown: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Wrapper for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorArea = ({
  selection,
  onSelectedFileChanged,
  simulatorShown,
  setSimulatorShown,
  ...props
}: EditorAreaProps) => {
  const intl = useIntl();
  const [isWideScreen] = useMediaQuery(widthXl);
  return (
    <Flex
      height="100%"
      flexDirection="column"
      {...props}
      backgroundColor="gray.10"
    >
      <Flex
        as="section"
        aria-label={intl.formatMessage({ id: "project-header" })}
        width="100%"
        alignItems="center"
        justifyContent="space-between"
        pr={isWideScreen ? 10 : 5}
        pl={isWideScreen ? "3rem" : "2rem"}
        py={2}
        height={topBarHeight}
      >
        <ProjectNameEditable
          color="gray.700"
          opacity="80%"
          fontSize="xl"
          data-testid="project-name"
          clickToEdit
        />
        <ActiveFileInfo
          filename={selection.file}
          onSelectedFileChanged={onSelectedFileChanged}
        />
        <ZoomControls display={["none", "none", "none", "flex"]} />
      </Flex>
      {/* Just for the line */}
      <Box
        ml={isWideScreen ? "6rem" : "5rem"}
        mr={isWideScreen ? "2.5rem" : "1.25rem"}
        mb={5}
        width={isWideScreen ? "calc(100% - 8.5rem)" : "calc(100% - 6.25rem)"}
        borderBottomWidth={2}
        borderColor="gray.200"
      />
      <Box position="relative" flex="1 1 auto" height={0}>
        <UndoRedoControls
          display={["none", "none", "none", "flex"]}
          zIndex="1"
          top={6}
          right={isWideScreen ? 10 : 5}
          position="absolute"
        />
        {flags.simulator && !simulatorShown && !flags.showAlternative && (
          <HideSimButtonOptions setSimulatorShown={setSimulatorShown} />
        )}
        <EditorContainer selection={selection} />
      </Box>
    </Flex>
  );
};

// Temporary component to test different show simulator button options.
interface HideSimButtonOptionsProps {
  setSimulatorShown: React.Dispatch<React.SetStateAction<boolean>>;
}

const HideSimButtonOptions = ({
  setSimulatorShown,
}: HideSimButtonOptionsProps) => {
  const [isWideScreen] = useMediaQuery(widthXl);
  const round = (
    <IconButton
      size="md"
      fontSize="x-large"
      variant="solid"
      icon={<RiPlayCircleFill color="gray.50" />}
      aria-label="Show simulator"
      position="absolute"
      right={isWideScreen ? 10 : 5}
      bottom={3}
      onClick={() => setSimulatorShown(true)}
      zIndex="1"
    />
  );
  const squarePlay = (
    <IconButton
      size="md"
      fontSize="x-large"
      variant="solid"
      icon={<RiPlayCircleFill color="gray.50" />}
      aria-label="Show simulator"
      position="absolute"
      right={0}
      bottom={3}
      onClick={() => setSimulatorShown(true)}
      zIndex="1"
      borderTopLeftRadius={10}
      borderTopRightRadius={0}
      borderBottomRightRadius={0}
      borderBottomLeftRadius={10}
    />
  );
  const squareMicrobit = (
    <IconButton
      size="md"
      variant="solid"
      icon={<FaceIcon />}
      aria-label="Show simulator"
      position="absolute"
      right={0}
      bottom={3}
      onClick={() => setSimulatorShown(true)}
      zIndex="1"
      borderTopLeftRadius={10}
      borderTopRightRadius={0}
      borderBottomRightRadius={0}
      borderBottomLeftRadius={10}
      p={1.5}
    />
  );
  const microbitBoard = (
    <Flex
      position="absolute"
      right={0}
      bottom={3}
      zIndex="1"
      alignItems="center"
      justifyContent="center"
    >
      <Button
        width="100%"
        height="100%"
        position="relative"
        borderTopLeftRadius={10}
        borderTopRightRadius={0}
        borderBottomRightRadius={0}
        borderBottomLeftRadius={10}
        px={2}
        pb={0.5}
        overflow="hidden"
        onClick={() => setSimulatorShown(true)}
        aria-label="Show simulator"
        border="none"
      >
        <Icon as={MicrobitBoard} w={20} h={20} />
        <Box
          bgColor="gray.200"
          width="100%"
          height="100%"
          position="absolute"
          top={0}
          left={0}
          opacity={0.5}
        />
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          alignItems="center"
          justifyContent="center"
          bgColor="gray.200"
          borderRadius="50%"
          maxW="38px"
          maxH="38px"
          overflow="hidden"
        >
          <Icon as={RiPlayCircleLine} color="brand.500" w={12} h={12} />
        </Flex>
      </Button>
    </Flex>
  );
  if (flags.showMicrobit) {
    return microbitBoard;
  } else if (flags.showSquarePlay) {
    return squarePlay;
  } else if (flags.showSquareMicrobit) {
    return squareMicrobit;
  }
  return round;
};

export default EditorArea;
