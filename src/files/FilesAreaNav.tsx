import { ButtonGroup } from "@chakra-ui/button";
import NewButton from "../project/NewButton";
import OpenButton from "../project/OpenButton";
import UploadButton from "../project/UploadButton";

const FilesAreaNav = () => {
  return (
    <ButtonGroup p={1}>
      <NewButton
        colorScheme="blue"
        mode="button"
        size="sm"
        height="10"
        variant="outline"
      />
      <OpenButton
        colorScheme="blue"
        mode="button"
        size="sm"
        height="10"
        text="Load…"
      />
    </ButtonGroup>
  );
};

export default FilesAreaNav;
