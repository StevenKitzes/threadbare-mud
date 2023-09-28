import { Statement } from 'better-sqlite3';

const db = require('./sqlite-get-db.ts');

import { Character, Exit, Item, Scene, User } from '../src/types';

export type Database = {
  readActiveCharacterBySession: (token: string) => Character | undefined;
  readCharacter: (characterId: string) => Character | undefined;
  readCharacterInventory: (characterId: string) => Item[] | undefined;
  readCharactersByUserId: (userId: string) => Character[] | undefined;
  readItem: (itemId: string) => Item | undefined;
  readScene: (sceneId: string) => Scene | undefined;
  readSceneExits: (sceneId: string) => Exit[] | undefined;
  readSceneInventory: (sceneId: string) => Item[] | undefined;
  readUser: (id: string) => User | undefined;
  readUserByName: (username: string) => User | undefined;
  readUserBySession: (token: string) => User | undefined;
  transact: (bundles: TransactBundle[]) => void;
  writeActiveCharacter: (userId: string, characterId: string) => boolean;
  writeItem: (id: string, name: string) => TransactBundle;
  writeScene: (id: string, name: string) => TransactBundle;
  writeSessionToUser: (userId: string, token: string) => boolean;
  writeUser: (id: string, username: string, password: string, email: string) => TransactBundle;
}

export type TransactBundle = {
  statement: Statement,
  runValues: any[]
};

type RawExit = {
  from_id: string,
  to_id: string,
  description: string,
  keyword_csv: string
}

export const readActiveCharacterBySession = (token: string): Character | undefined => {
  try {
    const character: Character = db.prepare(`
      SELECT characters.* FROM characters
      JOIN users ON characters.user_id = users.id
      WHERE users.session = ? AND characters.active = 1;
    `).get(token) as Character;
    return character;
  } catch (err: any) {
    console.error("Error retrieving active character from database by user id . . .", err.toString() || "count not parse error description");
    return undefined;
  }
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

export const readCharacterInventory = (characterId: string): Item[] | undefined => {
  try {
    return db.prepare(`
      SELECT * FROM items
      JOIN character_inventories
      ON items.id = character_inventories.item_id
      WHERE character_inventories.character_id = ?;
    `).all(characterId) as Item[];
  } catch (err: any) {
    console.error("Error retrieving character inventory list from database . . .", err.toString() || "count not parse error description");
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

export const readSceneExits = (sceneId: string): Exit[] | undefined => {
  try {
    const rawExits: RawExit[] = db.prepare(`
      SELECT * FROM scene_exits
      JOIN scenes
      ON scenes.id = scene_exits.from_id
      WHERE scenes.id = ?;
    `).all(sceneId) as RawExit[];
    return rawExits.map((rawExit: RawExit) => ({
      fromId: rawExit.from_id,
      toId: rawExit.to_id,
      description: rawExit.description,
      keywords: rawExit.keyword_csv.split(',')
    }));
  } catch (err: any) {
    console.error("Error retrieving potential scene exits from database . . .", err.toString() || "could not parse error description");
    return undefined;
  }
}

export const readSceneInventory = (sceneId: string): Item[] | undefined => {
  try {
    return db.prepare(`
      SELECT * FROM items
      JOIN scene_inventories
      ON items.id = scene_inventories.item_id
      WHERE scene_inventories.scene_id = ?;
    `).all(sceneId) as Item[];
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

// update ud
//   set assid = s.assid
// from sale s 
// where ud.id = s.udid;

export const writeActiveCharacter = (userId: string, characterId: string): boolean => {
  try {
    const statements: TransactBundle[] = [];
    statements.push({
      statement: db.prepare("UPDATE characters SET active = 0 WHERE user_id = ? AND active = 1;"),
      runValues: [userId]
    })
    statements.push({
      statement: db.prepare("UPDATE characters SET active = 1 WHERE id = ?;"),
      runValues: [characterId]
    })
    transact(statements);
    return true;
  } catch (err: any) {
    console.error("Error updating active character", characterId, "for user:", userId, err.toString());
    return false;
  }
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

export const writeSessionToUser = (userId: string, token: string | null): boolean => {
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
  readActiveCharacterBySession,
  readCharacter,
  readCharacterInventory,
  readCharactersByUserId,
  readItem,
  readScene,
  readSceneExits,
  readSceneInventory,
  readUser,
  readUserByName,
  readUserBySession,
  transact,
  writeActiveCharacter,
  writeItem,
  writeScene,
  writeSessionToUser,
  writeUser
};
export default database;
