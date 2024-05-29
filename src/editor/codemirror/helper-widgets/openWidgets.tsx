import { Button } from "@chakra-ui/react";
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
    <Button onClick={handleClick} size="xs">
      Open
    </Button>
  );
};

function createSoundWavePath(): string {
  let pathData = "M0,12";

  const totalPoints = 18;

  const stepSize = 24 / totalPoints;

  for (let i = 0; i < totalPoints; i++) {
    const x = i * stepSize;
    const angle = (x / totalPoints) * 3 * Math.PI;

    const heightVariation = Math.cos(angle) * 6;
    const y1 = 12 + heightVariation;
    const y2 = 12 - heightVariation;

    pathData += ` M${x},${y1} L${x},${y2}`;
  }

  return pathData;
}

export const OpenSoundComponent = ({
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

  const soundWavePath = createSoundWavePath();

  return (
    <Button
      onClick={handleClick}
      size="sm"
      height="25px"
      marginBottom="3px"
      marginLeft="5px"
      style={{ padding: "3px 3px" }}
    >
      <svg width="20" height="18" viewBox="0 0 24 24" fill="none">
        <path d={soundWavePath} stroke="green" strokeWidth="1" fill="none" />
      </svg>
    </Button>
  );
};
