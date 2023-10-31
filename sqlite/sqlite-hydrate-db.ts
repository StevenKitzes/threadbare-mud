const dbToHydrate = require('./sqlite-get-db.ts');

// constants to use in hydration of test db environment\
const adminId = "adminId";
const adminUsername = "admin";
const adminPassword = "$2b$12$A7fcgDqKv3b0gvtjTGZoy.eIMJgXRNJ.wQp9FPdZCZKGQKv71tCLu";
const adminEmail = "email@fake1.com";

const testUserId = "testUserId";
const testUserUsername = "testUserUsername";
const testUserPassword = "$2b$12$A7fcgDqKv3b0gvtjTGZoy.eIMJgXRNJ.wQp9FPdZCZKGQKv71tCLu";
const testUserEmail = "email@fake2.com";

const anotherUserId = "anotherUserId";
const anotherUserUsername = "anotherUserUsername";
const anotherUserPassword = "$2b$12$A7fcgDqKv3b0gvtjTGZoy.eIMJgXRNJ.wQp9FPdZCZKGQKv71tCLu";
const anotherUserEmail = "email@fake3.com";

const testScene1Id = "4";

const adminCharacterId = "adminCharacterId";
const adminCharacterName = "Sintur";

const testCharacter1Id = "testCharacter1Id";
const testCharacter1Name = "CharacterOne";

const testCharacter2Id = "testCharacter2Id";
const testCharacter2Name = "CharacterTwo";

const testCharacter3Id = "testCharacter3Id";
const testCharacter3Name = "CharacterThree";

function hydrate(sql: string, runArgs: (string | null)[]) {
  try {
    dbToHydrate.prepare(sql).run(...runArgs);
  } catch (err) {
    console.error(err, "that was an error");
  }          
}      

// Main stuff
dbToHydrate.transaction(() => {
  // Users table stuff
  hydrate("INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?);", [
    adminId, adminUsername, adminPassword, adminEmail
  ]);
  hydrate("INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?);", [
    testUserId, testUserUsername, testUserPassword, testUserEmail
  ]);      
  hydrate("INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?);", [
    anotherUserId, anotherUserUsername, anotherUserPassword, anotherUserEmail
  ]);      

  // Characters table stuff for admin
  const startingInventory: string[] = ['1'];
  hydrate(`
    INSERT INTO characters (id, user_id, name, job, health, health_max, light_attack, heavy_attack, ranged_attack, agility, strength, savvy, scene_id, checkpoint_id, active, stories, scene_states, money, inventory, xp, horse, faction_anger)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    adminCharacterId, adminId, adminCharacterName, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, '1', '0', '{"main":0}', '{}', '0', JSON.stringify(startingInventory), "0", null, "[]"
  ]);
  // super power testing dude
  hydrate(`
    INSERT INTO characters (
      id,
      user_id,
      name,
      job,
      health,
      health_max,
      light_attack,
      heavy_attack,
      ranged_attack,
      agility,
      strength,
      savvy,
      scene_id,
      checkpoint_id,
      active,
      stories,
      scene_states,
      money,
      inventory,
      xp,
      horse,
      faction_anger,
      headgear,
      armor,
      gloves,
      legwear,
      footwear,
      weapon,
      offhand
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    "agentOfLight",                       //  id,
    adminId,                              //  user_id,
    "Agent of the Light",                 //  name,
    'peacemaker',                         //  job,
    '1000',                               //  health,
    '1000',                               //  health_max,
    '100',                                //  light_attack,
    '100',                                //  heavy_attack,
    '100',                                //  ranged_attack,
    '100',                                //  agility,
    '100',                                //  strength,
    '100',                                //  savvy,
    '1',                                  //  scene_id,
    '1',                                  //  checkpoint_id,
    '0',                                  //  active,
    '{"main":0}',                         //  stories,
    '{}',                                 //  scene_states,
    '100000',                             //  money,
    JSON.stringify(startingInventory),    //  inventory,
    "10000",                              //  xp,
    null,                                 //  horse,
    "[]",                                 //  faction_anger
    "48",                                 //  headgear
    "49",                                 //  armor
    "50",                                 //  gloves
    "51",                                 //  legwear
    "52",                                 //  footwear
    "53",                                 //  weapon
    "46",                                 //  offhand
  ]);
})();

// Non-admin user
dbToHydrate.transaction(() => {
  hydrate(`
    INSERT INTO characters (id, user_id, name, job, health, health_max, light_attack, heavy_attack, ranged_attack, agility, strength, savvy, scene_id, checkpoint_id, active, stories, scene_states, money, inventory, xp, horse, faction_anger)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    testCharacter1Id, testUserId, testCharacter1Name, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, '1', '0', '{"main":0}', '{}', '0', '["1"]', "0", null, "[]"
  ]);
  hydrate(`
    INSERT INTO characters (id, user_id, name, job, health, health_max, light_attack, heavy_attack, ranged_attack, agility, strength, savvy, scene_id, checkpoint_id, active, stories, scene_states, money, inventory, xp, horse, faction_anger)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    testCharacter2Id, testUserId, testCharacter2Name, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, '1', '0', '{"main":0}', '{}', '0', '["1"]', "0", null, "[]"
  ]);
  hydrate(`
    INSERT INTO characters (id, user_id, name, job, health, health_max, light_attack, heavy_attack, ranged_attack, agility, strength, savvy, scene_id, checkpoint_id, active, stories, scene_states, money, inventory, xp, horse, faction_anger)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    testCharacter3Id, testUserId, testCharacter3Name, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, '1', '0', '{"main":0}', '{}', '0', '["1"]', "0", null, "[]"
  ]);
})();
