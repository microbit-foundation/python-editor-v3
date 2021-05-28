import { ButtonGroup } from "@chakra-ui/button";
import NewButton from "../project/NewButton";
import LoadButton from "../project/LoadButton";

const FilesAreaNav = () => {
  const size = "lg";
  return (
    <ButtonGroup
      pl={1}
      pr={1}
      spacing={0}
      variant="ghost"
      size="lg"
      colorScheme="black"
    >
      <NewButton mode="icon" />
      <LoadButton mode="icon" />
    </ButtonGroup>
  );
};

export default FilesAreaNav;
