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

  // Characters table stuff
  hydrate(`
    INSERT INTO characters (id, user_id, name, job, health, health_max, light_attack, heavy_attack, ranged_attack, agility, strength, savvy, scene_id, checkpoint_id, active, stories, scene_states, money, inventory)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    adminCharacterId, adminId, adminCharacterName, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, testScene1Id, '1', '{"main":0}', '{}', '0', '["1"]'
  ]);
})();

// Non-admin user
dbToHydrate.transaction(() => {
  hydrate(`
    INSERT INTO characters (id, user_id, name, job, health, health_max, light_attack, heavy_attack, ranged_attack, agility, strength, savvy, scene_id, checkpoint_id, active, stories, scene_states, money, inventory)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    testCharacter1Id, testUserId, testCharacter1Name, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, testScene1Id, '1', '{"main":0}', '{}', '0', '["1"]'
  ]);
  hydrate(`
    INSERT INTO characters (id, user_id, name, job, health, health_max, light_attack, heavy_attack, ranged_attack, agility, strength, savvy, scene_id, checkpoint_id, active, stories, scene_states, money, inventory)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    testCharacter2Id, testUserId, testCharacter2Name, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, testScene1Id, '1', '{"main":0}', '{}', '0', '["1"]'
  ]);
  hydrate(`
    INSERT INTO characters (id, user_id, name, job, health, health_max, light_attack, heavy_attack, ranged_attack, agility, strength, savvy, scene_id, checkpoint_id, active, stories, scene_states, money, inventory)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    testCharacter3Id, testUserId, testCharacter3Name, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, testScene1Id, '1', '{"main":0}', '{}', '0', '["1"]'
  ]);
})();
