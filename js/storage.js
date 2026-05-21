import { DB_NAME, DB_VERSION, STORE_NAME } from './state.js';

function openDB() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = function (e) {
      resolve(e.target.result);
    };
    req.onerror = function (e) {
      reject(e.target.error);
    };
  });
}

export function savePhoto(blob, height) {
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      var item = { blob: blob, height: height, date: new Date().toISOString() };
      var req = store.add(item);
      req.onsuccess = function () {
        resolve();
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
  });
}

export function loadPhotos() {
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readonly');
      var store = tx.objectStore(STORE_NAME);
      var req = store.getAll();
      req.onsuccess = function () {
        var items = req.result || [];
        items.reverse();
        items.forEach(function (item) {
          item.url = URL.createObjectURL(item.blob);
        });
        resolve(items);
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
  });
}

export function deletePhoto(id) {
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      var req = store.delete(id);
      req.onsuccess = function () {
        resolve();
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
  });
}
