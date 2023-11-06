{
  const dbToHydrate = require('./sqlite-get-db.ts');
  const { v4 } = require('uuid');

  // constants to use in hydration of test db environment\
  const adminId = "adminId";
  const adminUsername = "admin";
  const adminPassword = "$2b$12$.SGrzXKGj4pTZjfZLgfgseyIyIZcm6ipk9l3fssYO1D5NIDgga7d6";
  const adminEmail = "email@fake1.com";

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

    // Characters table stuff for admin
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
}