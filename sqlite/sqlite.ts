import { Statement } from 'better-sqlite3';

const db = require('./sqlite-get-db.ts');

import { Character, Item, Scene, SceneInventory, User } from '@/types.ts';

export type Database = {
  readCharacter: (characterId: string) => Character | undefined;
  readCharactersByUserId: (userId: string) => Character[] | undefined;
  readItem: (itemId: string) => Item | undefined;
  readScene: (sceneId: string) => Scene | undefined;
  readSceneInventory: (sceneId: string) => SceneInventory | undefined;
  readUser: (id: string) => User | undefined;
  readUserByName: (username: string) => User | undefined;
  readUserBySession: (token: string) => User | undefined;
  transact: (bundles: TransactBundle[]) => void;
  writeItem: (id: string, name: string) => TransactBundle;
  writeScene: (id: string, name: string) => TransactBundle;
  writeSessionToUser: (userId: string, token: string) => boolean;
  writeUser: (id: string, username: string, password: string, email: string) => TransactBundle;
}

export type TransactBundle = {
  statement: Statement,
  runValues: any[]
};

export const readCharacter = (characterId: string): Character | undefined => {
  try {
    const character: Character = db.prepare("SELECT * FROM characters WHERE id = ?;").get(characterId) as Character;
    return character;
  } catch (err: any) {
    console.error("Error retrieving character from database . . .", err.toString() || "could not parse error description");
    return undefined;
  }
};

export const readCharactersByUserId = (userId: string): Character[] | undefined => {
  try {
    const characters: Character[] = db.prepare(`
      SELECT * FROM characters WHERE user_id = ?;
    `).all(userId) as Character[];
    return characters;
  } catch (err: any) {
    console.error("Error retrieving character list from database . . .", err.toString() || "count not parse error description");
    return undefined;
  }
};

export const readItem = (itemId: string): Item | undefined => {
  try {
    const item: Item = db.prepare("SELECT * FROM items WHERE id = ?;").get(itemId) as Item;
    return item;
  } catch (err: any) {
    console.error("Error retrieving item from database . . .", err.toString() || "could not parse error description");
    return undefined;
  }
};

export const readScene = (sceneId: string): Scene | undefined => {
  try {
    const scene: Scene = db.prepare("SELECT * FROM scenes WHERE id = ?;").get(sceneId) as Scene;
    return scene;
  } catch (err: any) {
    console.error("Error retrieving scene from database . . .", err.toString() || "could not parse error description");
    return undefined;
  }
};

export const readSceneInventory = (sceneId: string): SceneInventory | undefined => {
  try {
    const sceneInventory: SceneInventory = {
      inventory:
        db.prepare(`
          SELECT * FROM items
          JOIN scene_inventories
          ON items.id = scene_inventories.item_id
          WHERE scene_inventories.scene_id = ?;
        `).all(sceneId) as Item[],
      scene:
        db.prepare(`
          SELECT * FROM scenes
          WHERE id = ?;
        `).get(sceneId) as Scene
    };
    return sceneInventory;
  } catch (err: any) {
    console.error("Error retrieving scene item list from database . . .", err.toString() || "count not parse error description");
    return undefined;
  }
};

export const readUser = (id: string): User | undefined => {
  try {
    const user: User = db.prepare("SELECT * FROM users WHERE id = ?;").get(id) as User;
    return user;
  } catch (err: any) {
    console.error("Error retrieving user from database . . .", err.toString() || "could not parse error description");
    return undefined;
  }
};

export const readUserByName = (username: string): User | undefined => {
  try {
    const user: User = db.prepare("SELECT * FROM users WHERE username = ?;").get(username) as User;
    return user;
  } catch (err: any) {
    console.error("Error retrieving user from database by name . . .", err.toString() || "could not parse error description");
    return undefined;
  }
};

export const readUserBySession = (token: string): User | undefined => {
  try {
    const user: User = db.prepare("SELECT * FROM users WHERE session = ?;").get(token) as User;
    return user;
  } catch (err: any) {
    console.error("Error retrieving user from database by session token . . .", err.toString() || "could not parse error description");
    return undefined;
  }
};

export const transact = (bundles: TransactBundle[]): void => {
  db.transaction(() => {
    bundles.forEach(bundle => {
      bundle.statement.run(...bundle.runValues);
    })
  })();
};

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

export const writeSessionToUser = (userId: string, token: string): boolean => {
  try {
    db.prepare("UPDATE users SET session = ? WHERE id = ?;")
      .run(token, userId);
    return true;
  } catch (err: any) {
    console.error("Error updating session for user:", userId, err.toString());
    return false;
  }
}

export const writeUser = (id: string, username: string, password: string, email: string): TransactBundle => {
  return {
    statement: db.prepare("INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?);"),
    runValues: [id, username, password, email]
  };
};

const database: Database = {
  readCharacter,
  readCharactersByUserId,
  readItem,
  readScene,
  readSceneInventory,
  readUser,
  readUserByName,
  readUserBySession,
  transact,
  writeItem,
  writeScene,
  writeSessionToUser,
  writeUser
};
export default database;
