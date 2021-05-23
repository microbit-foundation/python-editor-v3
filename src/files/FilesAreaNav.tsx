import { ButtonGroup } from "@chakra-ui/button";
import NewButton from "../project/NewButton";
import LoadButton from "../project/LoadButton";

const FilesAreaNav = () => {
  return (
    <ButtonGroup pl={1} pr={1} spacing={0}>
      <NewButton variant="ghost" mode="icon" colorScheme="black" />
      <LoadButton variant="ghost" mode="icon" colorScheme="black" />
    </ButtonGroup>
  );
};

export default FilesAreaNav;
