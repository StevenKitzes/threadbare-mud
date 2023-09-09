import { Statement } from 'better-sqlite3';

const db = require('../../sqlite/sqlite-get-db.ts');

import { Item, Scene } from '@/types.ts';

export type Database = {
  readItem: (itemId: string) => Item | null;
  readScene: (sceneId: string) => Scene | null;
  transact: (bundles: TransactBundle[]) => void;
  writeItem: (id: string, name: string) => TransactBundle;
  writeScene: (id: string, name: string) => TransactBundle;
}

export type TransactBundle = {
  statement: Statement,
  runValues: any[]
}

export const readItem = (itemId: string): Item | null => {
  try {
    const item: Item = db.prepare("SELECT * FROM items WHERE id = ?;").get(itemId) as Item;
    return item;
  } catch (err: any) {
    console.error("Error retrieving item from database . . .", err.toString() || "could not parse error description");
    return null;
  }
}

export const readScene = (sceneId: string): Scene | null => {
  try {
    const scene: Scene = db.prepare("SELECT * FROM scenes WHERE id = ?;").get(sceneId) as Scene;
    return scene;
  } catch (err: any) {
    console.error("Error retrieving scene from database . . .", err.toString() || "could not parse error description");
    return null;
  }
}

export const transact = (bundles: TransactBundle[]): void => {
  db.transaction(() => {
    bundles.forEach(bundle => {
      bundle.statement.run(...bundle.runValues);
    })
  })();
}

export const writeItem = (id: string, name: string): TransactBundle => {
  return {
    statement: db.prepare("INSERT INTO items (id, name) VALUES (?, ?);"),
    runValues: [id, name]
  };
};

export const writeScene = (id: string, name: string): TransactBundle => {
  return {
    statement: db.prepare("INSERT INTO scenes (id, name) VALUES (?, ?);"),
    runValues: [id, name]
  };
};

const database: Database = {
  readItem,
  readScene,
  transact,
  writeItem,
  writeScene
};
export default database;
