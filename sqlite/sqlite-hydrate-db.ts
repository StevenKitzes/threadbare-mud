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

const testScene1Id = "0";

const adminCharacterId = "adminCharacterId";
const adminCharacterName = "Sintur";

const testCharacter1Id = "testCharacter1Id";
const testCharacter1Name = "CharacterOne";

const testCharacter2Id = "testCharacter2Id";
const testCharacter2Name = "CharacterTwo";

const testCharacter3Id = "testCharacter3Id";
const testCharacter3Name = "CharacterThree";

function hydrate(sql: string, runArgs: string[]) {
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
  hydrate("INSERT INTO characters (id, user_id, name, scene_id, active, stories, scene_states, money, inventory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", [
    adminCharacterId, adminId, adminCharacterName, testScene1Id, "1", '{"main":0}', "{}", "0", '["0"]'
  ]);
})();

// Non-admin user
dbToHydrate.transaction(() => {
  hydrate("INSERT INTO characters (id, user_id, name, scene_id, active, stories, scene_states, money, inventory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", [
    testCharacter1Id, testUserId, testCharacter1Name, testScene1Id, "1", '{"main":0}', "{}", "0", '["0"]'
  ]);
  hydrate("INSERT INTO characters (id, user_id, name, scene_id, active, stories, scene_states, money, inventory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", [
    testCharacter2Id, testUserId, testCharacter2Name, testScene1Id, "0", '{"main":0}', "{}", "0", '["0"]'
  ]);
  hydrate("INSERT INTO characters (id, user_id, name, scene_id, active, stories, scene_states, money, inventory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", [
    testCharacter3Id, testUserId, testCharacter3Name, testScene1Id, "0", '{"main":0}', "{}", "0", '["0"]'
  ]);
})();
