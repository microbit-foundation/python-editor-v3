/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useProjectFileText } from "../project/project-hooks";
import { codeStructureSettings, useSettings } from "../settings/settings";
import { WorkbenchSelection } from "../workbench/use-selection";
import Editor from "./codemirror/CodeMirror";

interface EditorContainerProps {
  selection: WorkbenchSelection;
}

/**
 * Container for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorContainer = ({ selection }: EditorContainerProps) => {
  const [settings] = useSettings();
  const [defaultValue, onFileChange] = useProjectFileText(selection.file);
  return typeof defaultValue === "undefined" ? null : (
    <Editor
      defaultValue={defaultValue}
      selection={selection}
      onChange={onFileChange}
      fontSize={settings.fontSize}
      codeStructureSettings={codeStructureSettings(settings)}
      parameterHelpOption={settings.parameterHelp}
    />
  );
};

export default EditorContainer;
