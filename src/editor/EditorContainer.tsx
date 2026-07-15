/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback } from "react";
import { useProjectFileText } from "../project/project-hooks";
import { useSettings } from "../settings/settings";
import { WorkbenchSelection } from "../workbench/use-selection";
import Editor from "./codemirror/CodeMirror";
import ModuleOverlay from "./ModuleOverlay";

interface EditorContainerProps {
  selection: WorkbenchSelection;
}

/**
 * Container for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorContainer = ({ selection }: EditorContainerProps) => {
  const [settings, setSettings] = useSettings();
  const disableV2OnlyFeaturesWarning = useCallback(() => {
    setSettings({ ...settings, warnForApiUnsupportedByDevice: false });
  }, [setSettings, settings]);
  // Note fileInfo is not updated for ordinary text edits.
  const [fileInfo, onFileChange] = useProjectFileText(selection.file);
  if (fileInfo === undefined) {
    return null;
  }

  // Jacdac modules are managed by the editor and always shown read-only (the
  // user can read them but not edit), regardless of the third-party module
  // setting, which is why they're handled before the overlay branch.
  if (
    !fileInfo.isJacdacModule &&
    fileInfo.isThirdPartyModule &&
    !settings.allowEditingThirdPartyModules
  ) {
    return <ModuleOverlay moduleData={fileInfo.moduleData} />;
  }
  return (
    <Editor
      defaultValue={fileInfo.initialValue}
      selection={selection}
      onChange={onFileChange}
      fontSize={settings.fontSize}
      codeStructureOption={settings.codeStructureHighlight}
      parameterHelpOption={settings.parameterHelp}
      warnOnV2OnlyFeatures={settings.warnForApiUnsupportedByDevice}
      disableV2OnlyFeaturesWarning={disableV2OnlyFeaturesWarning}
      readOnly={fileInfo.isJacdacModule}
    />
  );
};

export default EditorContainer;
