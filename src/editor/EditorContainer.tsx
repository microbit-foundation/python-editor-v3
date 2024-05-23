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

  return fileInfo.isThirdPartyModule &&
    !settings.allowEditingThirdPartyModules ? (
    <ModuleOverlay moduleData={fileInfo.moduleData} />
  ) : (
    <Editor
      defaultValue={fileInfo.initialValue}
      selection={selection}
      onChange={onFileChange}
      fontSize={settings.fontSize}
      codeStructureOption={settings.codeStructureHighlight}
      parameterHelpOption={settings.parameterHelp}
      warnOnV2OnlyFeatures={settings.warnForApiUnsupportedByDevice}
      disableV2OnlyFeaturesWarning={disableV2OnlyFeaturesWarning}
    />
  );
};

export default EditorContainer;
