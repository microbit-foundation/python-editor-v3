/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
export class Positions {
  constructor(
    public top: number,
    public left: number,
    public height: number,
    public cursorActive: boolean
  ) {}
  eq(other: Positions) {
    return (
      this.top === other.top &&
      this.left === other.left &&
      this.height === other.height &&
      this.cursorActive === other.cursorActive
    );
  }
}

/**
 * A block representing a nested body and it's parent in with
 * DOM pixel locations.
 *
 * Both parent and body are defined for l-shapes, with the exception
 * that the body will be omitted if it's on the same line as the parent.
 *
 * For box presentations either the parent or the body will be defined.
 * In this case the parent is the entire compound statement rather than
 * a branch.
 *
 * This class is responsible for drawing the highlighting.
 */
export class VisualBlock {
  constructor(
    readonly bodyPullBack: boolean,
    readonly width: number,
    readonly parent?: Positions,
    readonly body?: Positions
  ) {}

  draw() {
    let parent: HTMLElement | undefined;
    let body: HTMLElement | undefined;
    let indent: HTMLElement | undefined;
    let active = this.parent?.cursorActive || this.body?.cursorActive;
    let activeClassname = active ? "cm-cs--active" : undefined;
    if (this.parent) {
      parent = blockWithClass("cm-cs--block cm-cs--parent", activeClassname);
    }
    if (this.body) {
      body = blockWithClass("cm-cs--block cm-cs--body", activeClassname);
    }
    if (this.parent && this.body) {
      // Add a indent element. We need this to draw a line under the
      // parent in l-shape mode. We could avoid adding the DOM element
      // in all other cases but for now we just style with CSS.
      indent = blockWithClass("cm-cs--indent", activeClassname);
    }
    this.adjust(parent, body, indent);
    const elements = [parent, body, indent].filter(Boolean) as HTMLElement[];
    return elements;
  }

  adjust(parent?: HTMLElement, body?: HTMLElement, indent?: HTMLElement) {
    // Parent is just the bit before the colon for l-shapes
    // but is the entire compound statement for boxes.
    if (parent && this.parent) {
      parent.style.left = this.parent.left + "px";
      parent.style.top = this.parent.top + "px";
      parent.style.height = this.parent.height + "px";
      parent.style.width = this.width - this.parent.left + "px";
    }

    // Optionally allows nested compound statements some breathing space
    const bodyPullBack = this.bodyPullBack ? 3 : 0;
    if (body && this.body) {
      body.style.left = this.body.left - bodyPullBack + "px";
      body.style.top = this.body.top + "px";
      body.style.height = this.body.height + "px";
      body.style.width = this.width - this.body.left + bodyPullBack + "px";
    }

    if (this.parent && parent && this.body && body && indent) {
      indent.style.left = this.parent.left + "px";
      indent.style.top = body.style.top;
      indent.style.width =
        this.body.left - this.parent.left - bodyPullBack + "px";
      indent.style.height = body.style.height;
    }
  }

  eq(other: VisualBlock) {
    return (
      equals(this.body, other.body) &&
      equals(this.parent, other.parent) &&
      this.width === other.width
    );
  }
}

const blockWithClass = (...classNames: (string | undefined)[]) => {
  const element = document.createElement("div");
  element.className = classNames.join(" ");
  return element;
};

const equals = (a?: Positions, b?: Positions) => {
  if (!a || !b) {
    return !a && !b;
  }
  return a.eq(b);
};
