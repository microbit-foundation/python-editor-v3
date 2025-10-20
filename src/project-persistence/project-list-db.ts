type ProjectDbWrapper = <T>(
  accessMode: "readonly" | "readwrite",
  callback: (projects: IDBObjectStore) => Promise<T>
) => Promise<T>;

export const withProjectDb: ProjectDbWrapper = async (accessMode, callback) => {
  return new Promise((res, rej) => {
    // TODO: what if multiple users? I think MakeCode just keeps everything...
    const openRequest = indexedDB.open("UserProjects", 1);
    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;

      // if the data object store doesn't exist, create it
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" });
        // no indexes at present, get the whole db each time
      }
    };

    openRequest.onsuccess = async () => {
      const db = openRequest.result;

      const tx = db.transaction("projects", accessMode);
      const store = tx.objectStore("projects");
      tx.onabort = rej;
      tx.onerror = rej;

      const result = await callback(store);

      // got the result, but don't return until the transaction is complete
      tx.oncomplete = () => res(result);
    };

    openRequest.onerror = rej;
  });
};
