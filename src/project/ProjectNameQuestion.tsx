import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { InputDialogBody } from "../common/InputDialog";

interface ProjectNameQuestionProps extends InputDialogBody<string> {}

const ProjectNameQuestion = ({
  error,
  value,
  setError,
  setValue,
  validate,
}: ProjectNameQuestionProps) => (
  <FormControl id="fileName" isRequired isInvalid={Boolean(error)}>
    <FormLabel>Name</FormLabel>
    <Input
      type="text"
      value={value}
      onChange={(e) => {
        const value = e.target.value;
        setValue(value);
        setError(validate(value));
      }}
    ></Input>
    <FormHelperText>
      The name is used when you download a hex file.
    </FormHelperText>
    <FormErrorMessage>{error}</FormErrorMessage>
  </FormControl>
);

export default ProjectNameQuestion;
