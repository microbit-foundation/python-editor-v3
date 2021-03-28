import { ButtonGroup } from "@chakra-ui/button";
import NewButton from "../project/NewButton";
import OpenButton from "../project/OpenButton";

const FilesAreaNav = () => {
  return (
    <ButtonGroup p={1}>
      <NewButton
        colorScheme="blue"
        mode="icon"
        size="md"
        height="10"
        variant="outline"
      />
      <OpenButton colorScheme="blue" mode="button" size="md" text="Load…" />
    </ButtonGroup>
  );
};

export default FilesAreaNav;
