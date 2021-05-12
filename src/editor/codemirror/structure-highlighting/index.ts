import { Compartment, Extension } from "@codemirror/state";
import { CodeStructureHighlight } from "../../../settings/settings";
import { boxes } from "./boxes";
import { brackets } from "./brackets";
import { lShapes } from "./l-shapes";

export const structureHighlightingCompartment = new Compartment();
export const structureHighlighting = (
  option: CodeStructureHighlight
): Extension => {
  switch (option) {
    case "l-shapes":
      return lShapes();
    case "brackets":
      return brackets();
    case "boxes":
      return boxes();
    default:
      return [];
  }
};
