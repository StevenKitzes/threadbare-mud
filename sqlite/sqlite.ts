import { Statement } from 'better-sqlite3';

const db = require('./sqlite-get-db.ts');

import { Character, CharacterUpdateOpts, FactionAnger, Horse, Stories, User } from '../src/types';
import { SceneIds } from '../src/socket-server/scenes/scenes';
import { ItemIds } from '../src/socket-server/items/items';
import jStr from '../src/utils/jStr';
import { logParts } from '../src/utils/log';
import { HandlerOptions } from '../src/socket-server/server';

type CharacterDBIntermediary = {
  id: string;
  user_id: string;
  name: string;
  job: string | null;
  health: number;
  health_max: number;
  light_attack: number;
  heavy_attack: number;
  ranged_attack: number;
  agility: number;
  strength: number;
  savvy: number;
  scene_id: string;
  checkpoint_id: string;
  active: number;
  stories: string;
  scene_states: string;
  money: number;
  inventory: string;
  xp: number;
  horse: string | null;
  faction_anger: string;
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
    headgear: intermediary.headgear as ItemIds,
    armor: intermediary.armor as ItemIds,
    gloves: intermediary.gloves as ItemIds,
    legwear: intermediary.legwear as ItemIds,
    footwear: intermediary.footwear as ItemIds,
    weapon: intermediary.weapon as ItemIds,
    offhand: intermediary.offhand as ItemIds,
    scene_id: intermediary.scene_id as SceneIds,
    checkpoint_id: intermediary.checkpoint_id as SceneIds,
    stories: JSON.parse(intermediary.stories),
    scene_states: JSON.parse(intermediary.scene_states),
    inventory: JSON.parse(intermediary.inventory),
    horse: intermediary.horse !== null ? JSON.parse(intermediary.horse) : null,
    factionAnger: JSON.parse(intermediary.faction_anger),

    getLightAttack: null,
    getHeavyAttack: null,
    getRangedAttack: null,
    getAgility: null,
    getStrength: null,
    getSavvy: null,
    getDamageEffect: null,
    getAccuracyEffect: null,
    getDefenseEffect: null,
    getDodgeEffect: null,
    getArmorEffect: null,
  
    temporaryEffects: [],
  };
  return character;
}

export type Database = {
  accountHasActiveCharacter: (token: string) => boolean;
  readActiveCharacterBySession: (token: string) => Character | undefined;
  readCharacter: (characterId: string) => Character | undefined;
  readCharactersByUserId: (userId: string) => Character[] | undefined;
  readUser: (id: string) => User | undefined;
  readUserByName: (username: string) => User | undefined;
  readUserBySession: (token: string) => User | undefined;
  transact: (bundles: TransactBundle[]) => void;
  writeActiveCharacter: (userId: string, characterId: string) => boolean;
  writeActiveCharacterTransactable: (userId: string, characterId: string) => TransactBundle[];
  writeCharacterData: (handlerOptions: HandlerOptions, opts: {
    job?: string,
    health?: number,
    health_max?: number,
    light_attack?: number,
    heavy_attack?: number,
    ranged_attack?: number,
    agility?: number,
    strength?: number,
    savvy?: number,
    scene_id?: SceneIds,
    stories?: Stories;
    scene_states?: any;
    money?: number;
    inventory?: ItemIds[];
    headgear?: ItemIds;
    armor?: ItemIds;
    gloves?: ItemIds;
    legwear?: ItemIds;
    footwear?: ItemIds;
    weapon?: ItemIds;
    offhand?: ItemIds;
    xp?: number;
    horse?: Horse;
    factionAnger?: FactionAnger[];
  }) => boolean;
  writeNewCharacter: (charId: string, userId: string, name: string) => TransactBundle;
  writeSessionToUser: (userId: string, token: string) => boolean;
  writeUser: (id: string, username: string, password: string, email: string) => TransactBundle;
}

export type TransactBundle = {
  statement: Statement,
  runValues: any[]
};

function newStoryTracking (): string {
  return JSON.stringify({
    main: 0,
    csiThreadbare: {
      grayOne: 0,
      skyguard: 0,
      weaver: 0,
      princeling: 0,
    }
  });
}

export const accountHasActiveCharacter = (token: string): boolean => {
  try {
    const count: number = db.prepare(`
      SELECT COUNT(*) as count FROM characters
      JOIN users ON characters.user_id = users.id
      WHERE users.session = ? AND characters.active = 1;
    `).get(token).count;
    if (count === 0) return false;
    return true;
  } catch (err: any) {
    console.error("Error counting active characters from database by session token . . .", err.toString() || "could not parse error description");
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
    console.error("Error retrieving active character from database by user id . . .", err.toString() || "could not parse error description");
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

export const writeActiveCharacterTransactable = (userId: string, characterId: string): TransactBundle[] => {
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
    return statements;
  } catch (err: any) {
    console.error("Error updating active character", characterId, "for user:", userId, err.toString());
    return [];
  }
}

export const writeCharacterData = ({ character, command }: HandlerOptions, opts: CharacterUpdateOpts): boolean => {
  try {
    const updatePrefix: string = "UPDATE characters SET ";
    const columnAssignments: string[] = [];
    const updateSuffix: string = " WHERE id = ?;";
    const values: any[] = [];

    if (opts.job !== undefined) {
      columnAssignments.push("job = ?");
      values.push(opts.job);
    }
    if (opts.health !== undefined) {
      columnAssignments.push("health = ?");
      values.push(opts.health);
    }
    if (opts.health_max !== undefined) {
      columnAssignments.push("health_max = ?");
      values.push(opts.health_max);
    }
    if (opts.light_attack !== undefined) {
      columnAssignments.push("light_attack = ?");
      values.push(opts.light_attack);
    }
    if (opts.heavy_attack !== undefined) {
      columnAssignments.push("heavy_attack = ?");
      values.push(opts.heavy_attack);
    }
    if (opts.ranged_attack !== undefined) {
      columnAssignments.push("ranged_attack = ?");
      values.push(opts.ranged_attack);
    }
    if (opts.agility !== undefined) {
      columnAssignments.push("agility = ?");
      values.push(opts.agility);
    }
    if (opts.strength !== undefined) {
      columnAssignments.push("strength = ?");
      values.push(opts.strength);
    }
    if (opts.savvy !== undefined) {
      columnAssignments.push("savvy = ?");
      values.push(opts.savvy);
    }
    if (opts.scene_id !== undefined) {
      columnAssignments.push("scene_id = ?");
      values.push(opts.scene_id);
    }
    if (opts.checkpoint_id !== undefined) {
      columnAssignments.push("checkpoint_id = ?");
      values.push(opts.checkpoint_id);
    }
    if (opts.stories !== undefined) {
      columnAssignments.push("stories = ?");
      values.push(jStr(opts.stories));
    }
    if (opts.scene_states !== undefined) {
      columnAssignments.push("scene_states = ?");
      values.push(jStr(opts.scene_states));
    }
    if (opts.money !== undefined) {
      columnAssignments.push("money = ?");
      values.push(opts.money);
    }
    if (opts.inventory !== undefined) {
      columnAssignments.push("inventory = ?");
      values.push(jStr(opts.inventory));
    }
    if (opts.headgear !== undefined) {
      columnAssignments.push("headgear = ?");
      values.push(opts.headgear);
    }
    if (opts.armor !== undefined) {
      columnAssignments.push("armor = ?");
      values.push(opts.armor);
    }
    if (opts.gloves !== undefined) {
      columnAssignments.push("gloves = ?");
      values.push(opts.gloves);
    }
    if (opts.legwear !== undefined) {
      columnAssignments.push("legwear = ?");
      values.push(opts.legwear);
    }
    if (opts.footwear !== undefined) {
      columnAssignments.push("footwear = ?");
      values.push(opts.footwear);
    }
    if (opts.weapon !== undefined) {
      columnAssignments.push("weapon = ?");
      values.push(opts.weapon);
    }
    if (opts.offhand !== undefined) {
      columnAssignments.push("offhand = ?");
      values.push(opts.offhand);
    }
    if (opts.xp !== undefined) {
      columnAssignments.push("xp = ?");
      values.push(opts.xp);
    }
    if (opts.horse !== undefined) {
      columnAssignments.push("horse = ?");
      values.push(jStr(opts.horse));
    }
    if (opts.factionAnger !== undefined) {
      columnAssignments.push("faction_anger = ?");
      values.push(jStr(opts.factionAnger));
    }

    db.prepare(`${updatePrefix}${columnAssignments.join(', ')}${updateSuffix}`)
      .run(...values, character.id);

    logParts(['user command <', command, '> triggered character db write:', opts]);

    if (opts.job !== undefined) {
      character.job = opts.job;
    }
    if (opts.health !== undefined) {
      character.health = opts.health;
    }
    if (opts.health_max !== undefined) {
      character.health_max = opts.health_max;
    }
    if (opts.light_attack !== undefined) {
      character.light_attack = opts.light_attack;
    }
    if (opts.heavy_attack !== undefined) {
      character.heavy_attack = opts.heavy_attack;
    }
    if (opts.ranged_attack !== undefined) {
      character.ranged_attack = opts.ranged_attack;
    }
    if (opts.agility !== undefined) {
      character.agility = opts.agility;
    }
    if (opts.strength !== undefined) {
      character.strength = opts.strength;
    }
    if (opts.savvy !== undefined) {
      character.savvy = opts.savvy;
    }
    if (opts.scene_id !== undefined) {
      character.scene_id = opts.scene_id;
    }
    if (opts.checkpoint_id !== undefined) {
      character.checkpoint_id = opts.checkpoint_id;
    }
    if (opts.stories !== undefined) {
      character.stories = opts.stories;
    }
    if (opts.scene_states !== undefined) {
      character.scene_states = opts.scene_states;
    }
    if (opts.money !== undefined) {
      character.money = opts.money;
    }
    if (opts.inventory !== undefined) {
      character.inventory = opts.inventory;
    }
    if (opts.headgear !== undefined) {
      character.headgear = opts.headgear;
    }
    if (opts.armor !== undefined) {
      character.armor = opts.armor;
    }
    if (opts.gloves !== undefined) {
      character.gloves = opts.gloves;
    }
    if (opts.legwear !== undefined) {
      character.legwear = opts.legwear;
    }
    if (opts.footwear !== undefined) {
      character.footwear = opts.footwear;
    }
    if (opts.weapon !== undefined) {
      character.weapon = opts.weapon;
    }
    if (opts.offhand !== undefined) {
      character.offhand = opts.offhand;
    }
    if (opts.xp !== undefined) {
      character.xp = opts.xp;
    }
    if (opts.horse !== undefined) {
      character.horse = opts.horse;
    }
    if (opts.factionAnger !== undefined) {
      character.factionAnger = opts.factionAnger;
    }

    return true;
  } catch (err: any) {
    console.error("Error updating faceted character data", err.toString());
    console.error('character', character);
    console.error('CharacterUpdateOpts', opts);
    return false;
  }
}

export const writeLiteralForTest_DANGEROUS = (query: string): void => {
  db.prepare(query).run();
}

export const writeNewCharacter = (charId: string, userId: string, name: string): TransactBundle => {
  return {
    statement: db.prepare(`
    INSERT INTO characters (id, user_id, name, job, health, health_max, light_attack, heavy_attack, ranged_attack, agility, strength, savvy, scene_id, checkpoint_id, active, stories, scene_states, money, inventory, xp, horse, faction_anger)
      VALUES (?, ?, ?, null, '100', '100', '10', '10', '10', '10', '10', '10', '4', '1', '1', ?, '{}', 0, '[]', 0, null, '[]');
    `),
    runValues: [charId, userId, name, newStoryTracking()],
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
    runValues: [id, username, password, email === '' ? null : email]
  };
};

const database: Database = {
  accountHasActiveCharacter,
  readActiveCharacterBySession,
  readCharacter,
  readCharactersByUserId,
  readUser,
  readUserByName,
  readUserBySession,
  transact,
  writeActiveCharacter,
  writeActiveCharacterTransactable,
  writeCharacterData,
  writeNewCharacter,
  writeSessionToUser,
  writeUser
};
export default database;
