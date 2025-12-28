const DB_NAME = 'TaskDashboardDB';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const getDB = async () => {
  if (db) {
    return db;
  }
  return await initDB();
};

export const getAllTasks = async () => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error('Failed to get tasks'));
    };
  });
};

export const saveTask = async (task) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(task);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error('Failed to save task'));
    };
  });
};

export const saveAllTasks = async (tasks) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing data first
    const clearRequest = store.clear();

    clearRequest.onsuccess = () => {
      // Add all tasks
      if (tasks.length === 0) {
        transaction.oncomplete = () => resolve();
        return;
      }

      const promises = tasks.map(task => {
        return new Promise((res, rej) => {
          const request = store.add(task);
          request.onsuccess = () => res();
          request.onerror = () => rej(new Error('Failed to save task'));
        });
      });

      Promise.all(promises)
        .then(() => {
          transaction.oncomplete = () => resolve();
        })
        .catch(reject);
    };

    clearRequest.onerror = () => {
      reject(new Error('Failed to clear tasks'));
    };
  });
};

export const deleteTask = async (taskId) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(taskId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete task'));
    };
  });
};

export const clearAllTasks = async () => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to clear tasks'));
    };
  });
};

