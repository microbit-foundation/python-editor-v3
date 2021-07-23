import { Compartment, Extension } from "@codemirror/state";
import { CodeStructureHighlight } from "../../../settings/settings";
import { codeStructure } from "./analysis";

export const structureHighlightingCompartment = new Compartment();
export const structureHighlighting = (
  option: CodeStructureHighlight
): Extension => {
  switch (option) {
    case "l-shapes":
      return codeStructure({
        shape: "box",
        background: "none",
        borders: "left-edge-only",
      });
    case "boxes":
      return codeStructure({
        shape: "box",
        background: "block",
        borders: "no-borders",
      });
    case "l-shape-boxes":
      return codeStructure({
        shape: "l-shape",
        background: "block",
        borders: "no-borders",
      });
    case "none":
      return [];
    default:
      return [];
  }
};
