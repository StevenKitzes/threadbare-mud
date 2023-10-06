import { Statement } from 'better-sqlite3';

const db = require('./sqlite-get-db.ts');

import { Character, Stories, User } from '../src/types';
import { SceneIds } from '../src/socket-server/scenes/scenes';

import jStr from '../src/utils/jStr';

type CharacterDBIntermediary = {
  id: string;
  user_id: string;
  name: string;
  scene_id: string;
  active: number;
  stories: string;
  scene_states: string;
  money: number;
  inventory: string;
  // worn items
  headgear: string | null;
  armor: string | null;
  gloves: string | null;
  legwear: string | null;
  footwear: string | null;
  weapon: string | null;
  offhand: string | null;
}

function dbToChar(intermediary: CharacterDBIntermediary): Character {
  const character: Character = {
    ...intermediary,
    stories: JSON.parse(intermediary.stories),
    scene_states: JSON.parse(intermediary.scene_states),
    inventory: JSON.parse(intermediary.inventory)
  };
  return character;
}

export type Database = {
  navigateCharacter: (charId: string, sceneIdEnum: SceneIds) => boolean;
  readActiveCharacterBySession: (token: string) => Character | undefined;
  readCharacter: (characterId: string) => Character | undefined;
  readCharactersByUserId: (userId: string) => Character[] | undefined;
  readUser: (id: string) => User | undefined;
  readUserByName: (username: string) => User | undefined;
  readUserBySession: (token: string) => User | undefined;
  transact: (bundles: TransactBundle[]) => void;
  writeActiveCharacter: (userId: string, characterId: string) => boolean;
  writeCharacterData: (charId: string, opts: {
    stories?: Stories;
    scene_states?: any;
    money?: number;
    inventory?: string[];
    headgear?: string;
    armor?: string;
    gloves?: string;
    legwear?: string;
    footwear?: string;
    weapon?: string;
    offhand?: string;
  }) => boolean;
  writeCharacterInventory: (charId: string, inventory: string[]) => boolean;
  writeCharacterSceneStates: (charId: string, sceneStates: any) => boolean;
  writeCharacterStory: (charId: string, story: Stories) => boolean;
  writeNewCharacter: (charId: string, userId: string, name: string) => TransactBundle;
  writeSessionToUser: (userId: string, token: string) => boolean;
  writeUser: (id: string, username: string, password: string, email: string) => TransactBundle;
}

export type TransactBundle = {
  statement: Statement,
  runValues: any[]
};

export const navigateCharacter = (charId: string, sceneIdEnum: SceneIds): boolean => {
  const sceneId: string = sceneIdEnum.toString();
  try {
    db.prepare("UPDATE characters SET scene_id = ? WHERE id = ?;")
      .run(sceneId, charId);
    return true;
  } catch (err: any) {
    console.error("Error navigating character with id", charId, "to scene with id", sceneId, err.toString());
    return false;
  }
}

export const readActiveCharacterBySession = (token: string): Character | undefined => {
  try {
    const intermediary: CharacterDBIntermediary = db.prepare(`
    SELECT characters.* FROM characters
    JOIN users ON characters.user_id = users.id
    WHERE users.session = ? AND characters.active = 1;
    `).get(token) as CharacterDBIntermediary;
    if (intermediary === undefined) throw new Error("Got undefined character.");
    return dbToChar(intermediary);
  } catch (err: any) {
    console.error("Error retrieving active character from database by user id . . .", err.toString() || "count not parse error description");
    return undefined;
  }
};

export const readCharacter = (characterId: string): Character | undefined => {
  try {
    const intermediary: CharacterDBIntermediary = db.prepare("SELECT * FROM characters WHERE id = ?;").get(characterId) as CharacterDBIntermediary;
    return dbToChar(intermediary);
  } catch (err: any) {
    console.error("Error retrieving character from database . . .", err.toString() || "could not parse error description");
    return undefined;
  }
};

export const readCharactersByUserId = (userId: string): Character[] | undefined => {
  try {
    const intermediaries: CharacterDBIntermediary[] = db.prepare(`
      SELECT * FROM characters WHERE user_id = ?;
    `).all(userId) as CharacterDBIntermediary[];
    return intermediaries.map(i => dbToChar(i));
  } catch (err: any) {
    console.error("Error retrieving character list from database . . .", err.toString() || "count not parse error description");
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

export const writeCharacterInventory = (charId: string, inventory: string[]) => {
  try {
    db.prepare("UPDATE characters SET inventory = ? WHERE id = ?;")
      .run(jStr(inventory), charId);
    return true;
  } catch (err: any) {
    console.error("Error updating character inventory for charId:", charId, "with inventory", inventory, err.toString());
    return false;
  }
}

export const writeCharacterSceneStates = (charId: string, sceneStates: any) => {
  try {
    db.prepare("UPDATE characters SET scene_states = ? WHERE id = ?;")
      .run(jStr(sceneStates), charId);
    return true;
  } catch (err: any) {
    console.error("Error updating character scene states for charId:", charId, "with scene states", sceneStates, err.toString());
    return false;
  }
}

export const writeCharacterData = (charId: string, opts: {
  stories?: Stories;
  scene_states?: any;
  money?: number;
  inventory?: string[];
  headgear?: string;
  armor?: string;
  gloves?: string;
  legwear?: string;
  footwear?: string;
  weapon?: string;
  offhand?: string;
}): boolean => {
  try {
    const statements: TransactBundle[] = [];

    if (opts.stories !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET stories = ? WHERE id = ?;"),
      runValues: [jStr(opts.stories), charId]
    });
    if (opts.scene_states !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET scene_states = ? WHERE id = ?;"),
      runValues: [jStr(opts.scene_states), charId]
    });
    if (opts.money !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET money = ? WHERE id = ?;"),
      runValues: [opts.money, charId]
    });
    if (opts.inventory !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET inventory = ? WHERE id = ?;"),
      runValues: [jStr(opts.inventory), charId]
    });
    if (opts.headgear !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET headgear = ? WHERE id = ?;"),
      runValues: [opts.headgear, charId]
    });
    if (opts.armor !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET armor = ? WHERE id = ?;"),
      runValues: [opts.armor, charId]
    });
    if (opts.gloves !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET gloves = ? WHERE id = ?;"),
      runValues: [opts.gloves, charId]
    });
    if (opts.legwear !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET legwear = ? WHERE id = ?;"),
      runValues: [opts.legwear, charId]
    });
    if (opts.footwear !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET footwear = ? WHERE id = ?;"),
      runValues: [opts.footwear, charId]
    });
    if (opts.weapon !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET weapon = ? WHERE id = ?;"),
      runValues: [opts.weapon, charId]
    });
    if (opts.offhand !== undefined) statements.push({
      statement: db.prepare("UPDATE characters SET offhand = ? WHERE id = ?;"),
      runValues: [opts.offhand, charId]
    });

    transact(statements);
    return true;
  } catch (err: any) {
    console.error("Error updating faceted character data", err.toString());
    return false;
  }
}

export const writeCharacterStory = (charId: string, stories: Stories): boolean => {
  try {
    db.prepare("UPDATE characters SET stories = ? WHERE id = ?;")
      .run(jStr(stories), charId);
    return true;
  } catch (err: any) {
    console.error("Error updating character story for charId:", charId, "with stories", stories, err.toString());
    return false;
  }
}

export const writeNewCharacter = (charId: string, userId: string, name: string): TransactBundle => {
  return {
    statement: db.prepare(`
      INSERT INTO characters (id, user_id, name, scene_id, active, stories, scene_states, money, inventory)
      VALUES (?, ?, ?, '0', 0, '{\"main\": 0}', '{}', 0, '[]');
    `),
    runValues: [charId, userId, name]
  };
}

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
  navigateCharacter,
  readActiveCharacterBySession,
  readCharacter,
  readCharactersByUserId,
  readUser,
  readUserByName,
  readUserBySession,
  transact,
  writeActiveCharacter,
  writeCharacterData,
  writeCharacterInventory,
  writeCharacterSceneStates,
  writeCharacterStory,
  writeNewCharacter,
  writeSessionToUser,
  writeUser
};
export default database;
