import { ButtonGroup } from "@chakra-ui/button";
import NewButton from "../project/NewButton";
import UploadButton from "../project/UploadButton";

const FilesAreaNav = () => {
  return (
    <ButtonGroup pl={1} pr={1} spacing={0}>
      <NewButton variant="ghost" mode="icon" />
      <UploadButton variant="ghost" mode="icon" />
    </ButtonGroup>
  );
};

export default FilesAreaNav;
