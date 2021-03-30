export interface TextDocument {
  toString(): string;
}

/**
 * Common interface for embedded editors.
 *
 * Useful while we're exploring options.
 */
export interface EditorComponentProps {
  className?: string;
  defaultValue: string;
  onChange: (doc: TextDocument) => void;

  fontSize: number;
  highlightCodeStructure: boolean;
}
