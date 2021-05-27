import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { InputDialogBody } from "../common/InputDialog";

interface NewFileNameQuestionProps extends InputDialogBody<string> {}

const NewFileNameQuestion = ({
  error,
  value,
  setError,
  setValue,
  validate,
}: NewFileNameQuestionProps) => (
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
    <FormHelperText color="gray.700">
      We'll add the <code>.py</code> extension for you.
    </FormHelperText>
    <FormErrorMessage>{error}</FormErrorMessage>
  </FormControl>
);

export default NewFileNameQuestion;
