
export interface HistoryEntry {
  projectId: string;
  revisionId: string;
  parentId: string;
  data: Uint8Array;
  timestamp: number;
}

export type HistoryList = HistoryEntry[];

type HistoryDbWrapper = <T>(
  accessMode: "readonly" | "readwrite",
  callback: (revisions: IDBObjectStore) => Promise<T>
) => Promise<T>;

export const withHistoryDb: HistoryDbWrapper = async (accessMode, callback) => {
  return new Promise((res, rej) => {
    const openRequest = indexedDB.open("UserProjectHistory", 1);
    openRequest.onupgradeneeded = (evt: IDBVersionChangeEvent) => {
      const db = openRequest.result;
      const tx = (evt.target as IDBOpenDBRequest).transaction;

      let revisions: IDBObjectStore;
      if (!db.objectStoreNames.contains("revisions")) {
        revisions = db.createObjectStore("revisions", { autoIncrement:true });
      } else {
        revisions = tx!.objectStore("revisions");
      }
      if (!revisions.indexNames.contains("projectRevision")) {
        revisions.createIndex("projectRevision", ["projectId", "revisionId"]);
      }
      if (!revisions.indexNames.contains("projectParent")) {
        revisions.createIndex("projectParent", ["projectId", "parentId"]);
      }
      if (!revisions.indexNames.contains("projectId")) {
        revisions.createIndex("projectId", "projectId");
      }
    };

    openRequest.onsuccess = async () => {
      const db = openRequest.result;

      const tx = db.transaction("revisions", accessMode);
      const store = tx.objectStore("revisions");
      tx.onabort = rej;
      tx.onerror = rej;

      const result = await callback(store);

      // got the result, but don't return until the transaction is complete
      tx.oncomplete = () => res(result);
    };

    openRequest.onerror = rej;
  });
};
