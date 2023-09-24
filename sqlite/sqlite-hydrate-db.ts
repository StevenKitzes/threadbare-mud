const dbToHydrate = require('./sqlite-get-db.ts');

// constants to use in hydration of test db environment\
const MAIN_STORY = 'MAIN_STORY';

const adminId = "d3ae16dc-453b-4717-b0ec-31e33ca0a2d8";
const adminUsername = "admin";
const adminPassword = "$2b$12$A7fcgDqKv3b0gvtjTGZoy.eIMJgXRNJ.wQp9FPdZCZKGQKv71tCLu";
const adminEmail = "winds23@gmail.com";

const userId = "userTestId";
const username = "justauser";
const userPassword = "$2b$12$A7fcgDqKv3b0gvtjTGZoy.eIMJgXRNJ.wQp9FPdZCZKGQKv71tCLu";
const userEmail = "winds23@sharklasers.com";

const scene1id = "scene1TestId";
const scene1name = "A boring room";

const scene2id = "scene2TestId";
const scene2name = "An interesting room";

const characterId = "characterTestId";
const characterName = "Mister Admin";

const userCharacterId = "userCharacterTestId";
const userCharacterName = "Not Admin Character";

const anotherCharacterId = "anotherCharacterTestId";
const anotherCharacterName = "Another Character";

const andAnotherCharacterId = "andAnnotherCharacterTestId";
const andAnotherCharacterName = "And Another Character";

const item1id = "item1TestId";
const item1name = "A sword";
const item1description = "It is probably a sword, but how can you be so sure?";

const item2id = "item2TestId";
const item2name = "A shovel";
const item2description = "It looks a lot like a shovel, but how can you be certain it's not a sword?";

function hydrate(sql: string, runArgs: string[]) {
  try {
    dbToHydrate.prepare(sql).run(...runArgs);
  } catch (err) {
    console.error(err, "that was an error");
  }          
}      

// Main stuff
dbToHydrate.transaction(() => {
  // Stories table stuff
  hydrate("INSERT INTO stories (story) VALUES (?);", [MAIN_STORY]);

  // Users table stuff
  hydrate("INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?);", [
    adminId, adminUsername, adminPassword, adminEmail
  ]);      

  // Scenes table stuff
  hydrate("INSERT INTO scenes (id, name) VALUES (?, ?);", [
    scene1id, scene1name
  ]);    
  hydrate("INSERT INTO scenes (id, name) VALUES (?, ?);", [
    scene2id, scene2name
  ]);    

  // Characters table stuff
  hydrate("INSERT INTO characters (id, user_id, name, scene_id, active) VALUES (?, ?, ?, ?, ?);", [
    characterId, adminId, characterName, scene1id, "1"
  ]);  

  // Items table stuff
  hydrate("INSERT INTO items (id, name, description) VALUES (?, ?, ?);", [
    item1id, item1name, item1description
  ]);
  hydrate("INSERT INTO items (id, name, description) VALUES (?, ?, ?);", [
    item2id, item2name, item2description
  ]);

  // Scene inventory stuff
  hydrate("INSERT INTO scene_inventories (scene_id, item_id) VALUES (?, ?);", [
    scene1id, item1id
  ]);
  hydrate("INSERT INTO scene_inventories (scene_id, item_id) VALUES (?, ?);", [
    scene2id, item2id
  ]);

  // Character inventory stuff
  hydrate("INSERT INTO character_inventories (character_id, item_id) VALUES (?, ?);", [
    characterId, item1id
  ]);
  hydrate("INSERT INTO character_inventories (character_id, item_id) VALUES (?, ?);", [
    characterId, item2id
  ]);

  // Scene description stuff
  hydrate("INSERT INTO scene_descriptions (scene_id, story, progress, description) VALUES (?, ?, ?, ?);", [
    scene1id, MAIN_STORY, "0", "A room that, quite frankly, bores you out of your mind."
  ]);
  hydrate("INSERT INTO scene_descriptions (scene_id, story, progress, description) VALUES (?, ?, ?, ?);", [
    scene1id, MAIN_STORY, "1", "A room that is objectively still rather boring, but bores you less than it used to."
  ]);
  hydrate("INSERT INTO scene_descriptions (scene_id, story, progress, description) VALUES (?, ?, ?, ?);", [
    scene2id, MAIN_STORY, "0", "A room that is full of interesting things to look at."
  ]);

  // Scene exit stuff
  hydrate("INSERT INTO scene_exits (from_id, to_id, description, keyword_csv) VALUES (?, ?, ?, ?);", [
    scene1id, scene2id, "There is a door to another room that looks more interesting.", "door,room,interesting"
  ]);
  hydrate("INSERT INTO scene_exits (from_id, to_id, description, keyword_csv) VALUES (?, ?, ?, ?);", [
    scene2id, scene1id, "Here is a door to a room that is probably more boring.", "door,room,boring"
  ]);

  // Character story progress stuff
  hydrate("INSERT INTO character_story_progress (character_id, story, progress) VALUES (?, ?, ?);", [
    characterId, MAIN_STORY, "0"
  ]);
})();

// Non-admin user
dbToHydrate.transaction(() => {
  // Users table stuff
  hydrate("INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?);", [
    userId, username, userPassword, userEmail
  ]);      

  // Characters table stuff
  hydrate("INSERT INTO characters (id, user_id, name, scene_id, active) VALUES (?, ?, ?, ?, ?);", [
    userCharacterId, userId, userCharacterName, scene2id, "1"
  ]);
  hydrate("INSERT INTO characters (id, user_id, name, scene_id, active) VALUES (?, ?, ?, ?, ?);", [
    anotherCharacterId, userId, anotherCharacterName, scene2id, "0"
  ]);
  hydrate("INSERT INTO characters (id, user_id, name, scene_id, active) VALUES (?, ?, ?, ?, ?);", [
    andAnotherCharacterId, userId, andAnotherCharacterName, scene2id, "0"
  ]);

  // Character story progress stuff
  hydrate("INSERT INTO character_story_progress (character_id, story, progress) VALUES (?, ?, ?);", [
    userCharacterId, MAIN_STORY, "1"
  ]);
  hydrate("INSERT INTO character_story_progress (character_id, story, progress) VALUES (?, ?, ?);", [
    anotherCharacterId, MAIN_STORY, "1"
  ]);
  hydrate("INSERT INTO character_story_progress (character_id, story, progress) VALUES (?, ?, ?);", [
    andAnotherCharacterId, MAIN_STORY, "1"
  ]);

  // Character inventory stuff
  hydrate("INSERT INTO character_inventories (character_id, item_id) VALUES (?, ?);", [
    userCharacterId, item1id
  ]);
  hydrate("INSERT INTO character_inventories (character_id, item_id) VALUES (?, ?);", [
    userCharacterId, item1id
  ]);
  hydrate("INSERT INTO character_inventories (character_id, item_id) VALUES (?, ?);", [
    userCharacterId, item2id
  ]);
  hydrate("INSERT INTO character_inventories (character_id, item_id) VALUES (?, ?);", [
    userCharacterId, item2id
  ]);
})();
