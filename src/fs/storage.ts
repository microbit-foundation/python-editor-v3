import config from "../config";

/**
 * Backing storage for the file system.
 *
 * We use this to store and restore the users program.
 */
export interface FSStorage {
  ls(): string[];
  exists(filename: string): boolean;
  read(filename: string): string;
  write(filename: string, content: string): void;
  remove(filename: string): void;
  setProjectName(projectName: string): void;
  projectName(): string;
}

/**
 * Basic local storage implementation.
 *
 * Needs revisiting to consider multiple tab effects.
 */
export class FSLocalStorage implements FSStorage {
  private prefix = "fs/";

  ls() {
    return Object.keys(localStorage)
      .filter((n) => n.startsWith(this.prefix))
      .map((n) => n.substring(this.prefix.length));
  }

  exists(filename: string) {
    return localStorage.getItem(this.prefix + filename) !== null;
  }

  setProjectName(projectName: string) {
    // If we moved this to a file we could also roundtrip it via the hex.
    localStorage.setItem("projectName", projectName);
  }

  projectName(): string {
    return localStorage.getItem("projectName") || config.defaultProjectName;
  }

  read(name: string): string {
    const item = localStorage.getItem(this.prefix + name);
    if (typeof item !== "string") {
      throw new Error(`No such file ${name}`);
    }
    return item;
  }

  write(name: string, content: string): void {
    localStorage.setItem(this.prefix + name, content);
  }

  remove(name: string): void {
    this.read(name);
    localStorage.removeItem(this.prefix + name);
  }
}
