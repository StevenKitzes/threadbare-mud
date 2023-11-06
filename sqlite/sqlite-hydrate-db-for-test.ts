{
  const dbToHydrate = require('./sqlite-get-db.ts');
  const { v4 } = require('uuid');

  // constants to use in hydration of test db environment\
  const adminId = "adminId";
  const adminUsername = "admin";
  const adminPassword = "$2b$12$.SGrzXKGj4pTZjfZLgfgseyIyIZcm6ipk9l3fssYO1D5NIDgga7d6";
  const adminEmail = "email@fake1.com";

  const testUserId = "testUserId";
  const testUserUsername = "testUserUsername";
  const testUserPassword = "$2b$12$.SGrzXKGj4pTZjfZLgfgseyIyIZcm6ipk9l3fssYO1D5NIDgga7d6";
  const testUserEmail = "email@fake2.com";

  const anotherUserId = "anotherUserId";
  const anotherUserUsername = "anotherUserUsername";
  const anotherUserPassword = "$2b$12$.SGrzXKGj4pTZjfZLgfgseyIyIZcm6ipk9l3fssYO1D5NIDgga7d6";
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

  const hydrate = (sql: string, runArgs: (string | null)[]) => {
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
      adminCharacterId, adminId, adminCharacterName, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, '1', '1', '{"main":0}', '{}', '0', JSON.stringify(startingInventory), "0", null, "[]"
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
      adminId,                              //  id,
      adminId,                              //  user_id,
      "A passing shadow",                   //  name,
      'spymaster',                          //  job,
      '100000',                             //  health,
      '100000',                             //  health_max,
      '1000',                               //  light_attack,
      '1000',                               //  heavy_attack,
      '1000',                               //  ranged_attack,
      '1000',                               //  agility,
      '1000',                               //  strength,
      '1000',                               //  savvy,
      '1',                                  //  scene_id,
      '1',                                  //  checkpoint_id,
      '1',                                  //  active,
      '{"main":1}',                         //  stories,
      '{}',                                 //  scene_states,
      '10000000',                           //  money,
      '[]',                                 //  inventory,
      "0",                                  //  xp,
      null,                                 //  horse,
      "[]",                                 //  faction_anger
      "21",                                 //  headgear
      "20",                                 //  armor
      "45",                                 //  gloves
      "23",                                 //  legwear
      "24",                                 //  footwear
      "29",                                 //  weapon
      "46",                                 //  offhand
    ]);
  })();

  // For playwright tests
  dbToHydrate.transaction(() => {
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
      'item-tester',                        //  id,
      testUserId,                           //  user_id,
      "ItemTester",                         //  name,
      'peacemaker',                         //  job,
      '100',                                //  health,
      '100',                                //  health_max,
      '10',                                 //  light_attack,
      '10',                                 //  heavy_attack,
      '10',                                 //  ranged_attack,
      '10',                                 //  agility,
      '10',                                 //  strength,
      '10',                                 //  savvy,
      '1',                                  //  scene_id,
      '1',                                  //  checkpoint_id,
      '0',                                  //  active,
      '{"main":1}',                         //  stories,
      '{}',                                 //  scene_states,
      '0',                                  //  money,
      '["1"]',                                 //  inventory,
      "0",                                  //  xp,
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
  dbToHydrate.transaction(() => {
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
      'purchase-tester',                    //  id,
      testUserId,                           //  user_id,
      "PurchaseTester",                     //  name,
      'peacemaker',                         //  job,
      '100',                                //  health,
      '100',                                //  health_max,
      '10',                                 //  light_attack,
      '10',                                 //  heavy_attack,
      '10',                                 //  ranged_attack,
      '10',                                 //  agility,
      '10',                                 //  strength,
      '10',                                 //  savvy,
      '9',                                  //  scene_id,
      '1',                                  //  checkpoint_id,
      '0',                                  //  active,
      '{"main":1}',                         //  stories,
      '{}',                                 //  scene_states,
      '100',                                //  money,
      '["1"]',                              //  inventory,
      "0",                                  //  xp,
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
      testCharacter1Id, testUserId, testCharacter1Name, null, '100', '100', '10', '10', '10', '10', '10', '10', testScene1Id, '1', '1', '{"main":0}', '{}', '0', '["1"]', "0", null, "[]"
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
}