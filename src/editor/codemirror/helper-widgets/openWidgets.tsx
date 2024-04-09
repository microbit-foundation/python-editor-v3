import { Button, HStack } from "@chakra-ui/react";
import { StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useCallback } from "react";

export const openWidgetEffect = StateEffect.define<number>();
export const OpenReactComponent = ({
  loc,
  view,
}: {
  loc: number;
  view: EditorView;
}) => {
  const handleClick = useCallback(() => {
    view.dispatch({
      effects: [openWidgetEffect.of(loc)],
    });
  }, [loc, view]);
  return (
    <HStack fontFamily="body" spacing={5} py={3}>
      <Button onClick={handleClick}>Open</Button>
    </HStack>
  );
};
