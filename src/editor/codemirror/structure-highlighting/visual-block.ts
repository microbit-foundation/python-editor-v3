export class Positions {
  constructor(public top: number, public left: number, public height: number) {}
  eq(other: Positions) {
    return (
      this.top === other.top &&
      this.left === other.left &&
      this.height === other.height
    );
  }
}

/**
 * A block representing a nested body and it's parent in with
 * DOM pixel locations.
 *
 * This class is responsible for drawing the highlighting.
 */
export class VisualBlock {
  constructor(
    readonly name: string,
    readonly parent?: Positions,
    readonly body?: Positions
  ) {}

  draw() {
    let parent: HTMLElement | undefined;
    let body: HTMLElement | undefined;
    if (this.parent) {
      parent = document.createElement("div");
      parent.className = "cm-lshapebox";
    }
    if (this.body) {
      body = document.createElement("div");
      body.className = "cm-lshapebox";
    }
    this.adjust(parent, body);
    return [parent, body].filter(Boolean) as HTMLElement[];
  }

  adjust(parent?: HTMLElement, body?: HTMLElement) {
    // Parent is just the bit before the colon.
    if (parent && this.parent) {
      parent.style.left = this.parent.left + "px";
      parent.style.top = this.parent.top + "px";
      parent.style.height = this.parent.height + "px";
      parent.style.width = `calc(100% - ${this.parent.left}px)`;
    }

    // Allows nested compound statements some breathing space
    if (body && this.body) {
      const bodyPullBack = 3;
      body.style.left = this.body.left - bodyPullBack + "px";
      body.style.top = this.body.top + "px";
      body.style.height = this.body.height + "px";
      body.style.width = `calc(100% - ${this.body.left}px)`;
      body.style.borderTopLeftRadius = "unset";
    }
  }

  eq(other: VisualBlock) {
    return equals(this.body, other.body) && equals(this.parent, other.parent);
  }
}

const equals = (a?: Positions, b?: Positions) => {
  if (!a || !b) {
    return !a && !b;
  }
  return a.eq(b);
};
