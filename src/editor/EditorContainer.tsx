/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useProjectFileText } from "../project/project-hooks";
import { useSessionSettings } from "../settings/session-settings";
import { useSettings } from "../settings/settings";
import { WorkbenchSelection } from "../workbench/use-selection";
import Editor from "./codemirror/CodeMirror";
import ModuleOverlay from "./ModuleOverlay";

interface EditorContainerProps {
  selection: WorkbenchSelection;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * Container for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorContainer = ({
  selection,
  onSelectedFileChanged,
}: EditorContainerProps) => {
  const [settings] = useSettings();
  const [defaultValue, onFileChange, isModule] = useProjectFileText(
    selection.file
  );
  const [sessionSettings, setSessionSettings] = useSessionSettings();
  const moduleIsWritable = (filename: string): boolean | undefined => {
    return sessionSettings.modulesPermissions[filename]?.writePermission;
  };
  return typeof defaultValue === "undefined" ? null : isModule &&
    !moduleIsWritable(selection.file) ? (
    <ModuleOverlay
      selection={selection}
      sessionSettings={sessionSettings}
      setSessionSettings={setSessionSettings}
      onSelectedFileChanged={onSelectedFileChanged}
    />
  ) : (
    <Editor
      defaultValue={defaultValue}
      selection={selection}
      onChange={onFileChange}
      fontSize={settings.fontSize}
      codeStructureOption={settings.codeStructureHighlight}
      parameterHelpOption={settings.parameterHelp}
    />
  );
};

export default EditorContainer;
