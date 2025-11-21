import { IndexeddbPersistence } from "y-indexeddb";
import { Awareness } from "y-protocols/awareness.js";
import * as Y from "yjs";

/**
 * Because the ydoc persistence/sync needs to clean itself up from time to time
 * it is in a class with the following state. It is agnostic in itself whether the project with the
 * specified UID exists.
 *
 * constructor - sets up the state
 * init - connects the persistence store, and local sync broadcast. Asynchronous, so you can await it
 * destroy - disconnects everything that was connected in init, cleans up the persistence store
 */
export class ProjectStore {
  public ydoc: Y.Doc;
  public awareness: Awareness;
  private broadcastHandler: (e: MessageEvent<SyncMessage>) => void;
  private persistence: IndexeddbPersistence;
  private updates: BroadcastChannel;
  private updatePoster: (update: Uint8Array) => void;

  constructor(public projectId: string, projectChangedListener: () => void) {
    const ydoc = new Y.Doc();
    this.ydoc = ydoc;
    this.awareness = new Awareness(this.ydoc);

    this.persistence = new IndexeddbPersistence(this.projectId, this.ydoc);

    const clientId = `${Math.random()}`; // Used by the broadcasthandler to know whether we sent a data update
    this.broadcastHandler = ({ data }: MessageEvent<SyncMessage>) => {
      if (data.clientId !== clientId && data.projectId === projectId) {
        Y.applyUpdate(ydoc, data.update);
      }
    };

    this.updates = new BroadcastChannel("yjs");
    this.updatePoster = ((update: Uint8Array) => {
      this.updates.postMessage({ clientId, update, projectId });
      projectChangedListener();
    }).bind(this);
  }

  public async persist() {
    await new Promise((res) => this.persistence.once("synced", res));
    migrate(this.ydoc);
  }

  public startSyncing() {
    this.ydoc.on("update", this.updatePoster);
    this.updates.addEventListener("message", this.broadcastHandler);
  }

  public destroy() {
    this.ydoc.off("update", this.updatePoster);
    this.updates.removeEventListener("message", this.broadcastHandler);
    this.updates.close();
    void this.persistence.destroy();
  }
}

/**
 * This is a kind of example of what migration could look like. It's not a designed approach at this point.
 */
const migrate = (doc: Y.Doc) => {
  const meta = doc.getMap("meta");
  if (!meta.has("version")) {
    // If the project has no version, assume it's from whatever this app did before ProjectStorageProvider
    // This could be a per-app handler
    meta.set("version", 1);
    meta.set("projectName", "default"); // TODO: get this from the last loaded project name
  }
};

interface SyncMessage {
  clientId: string;
  projectId: string;
  update: Uint8Array;
}