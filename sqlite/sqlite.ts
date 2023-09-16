import { Statement } from 'better-sqlite3';

const db = require('./sqlite-get-db.ts');

import { Item, Scene, User } from '@/types.ts';

export type Database = {
  readItem: (itemId: string) => Item | null;
  readScene: (sceneId: string) => Scene | null;
  readUser: (id: string) => User | null;
  readUserByName: (username: string) => User | null;
  transact: (bundles: TransactBundle[]) => void;
  writeItem: (id: string, name: string) => TransactBundle;
  writeScene: (id: string, name: string) => TransactBundle;
  writeUser: (id: string, username: string, password: string, email: string) => TransactBundle;
}

export type TransactBundle = {
  statement: Statement,
  runValues: any[]
}

export const readItem = (itemId: string): Item | null => {
  try {
    console.log('trying read with itemId', itemId);
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

export const readUser = (id: string): User | null => {
  try {
    const user: User = db.prepare("SELECT * FROM users WHERE id = ?;").get(id) as User;
    return user;
  } catch (err: any) {
    console.error("Error retrieving user from database . . .", err.toString() || "could not parse error description");
    return null;
  }
}

export const readUserByName = (username: string): User | null => {
  try {
    const user: User = db.prepare("SELECT * FROM users WHERE username = ?;").get(username) as User;
    return user;
  } catch (err: any) {
    console.error("Error retrieving user from database by name . . .", err.toString() || "could not parse error description");
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

export const writeUser = (id: string, username: string, password: string, email: string): TransactBundle => {
  return {
    statement: db.prepare("INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?);"),
    runValues: [id, username, password, email]
  };
};

const database: Database = {
  readItem,
  readScene,
  readUser,
  readUserByName,
  transact,
  writeItem,
  writeScene,
  writeUser
};
export default database;
