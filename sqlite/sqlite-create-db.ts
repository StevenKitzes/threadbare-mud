const { Statement } = require('better-sqlite3');
const db = require('./sqlite-get-db.ts');

const statements: typeof Statement[] = [];

// Drop existing tables if they exist
statements.push(db.prepare(`DROP TABLE IF EXISTS character_story_progress;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS scene_exits;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS scene_descriptions;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS character_inventories;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS scene_inventories;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS character_story_progress;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS items;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS characters;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS scenes;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS users;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS stories;`));

// Create stories table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS stories (
  story TEXT UNIQUE PRIMARY KEY
);`));

// Create users table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id TEXT UNIQUE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  session_token TEXT,
  session_expiry INTEGER
);`));

// Create scenes table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS scenes (
  id TEXT UNIQUE PRIMARY KEY,
  name TEXT NOT NULL
);`));

// characters owned by users
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS characters (
  id TEXT UNIQUE PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT UNIQUE NOT NULL,
  scene_id TEXT NOT NULL,
  active INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (scene_id) REFERENCES scenes (id)
);`));

// Create items table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS items (
  id TEXT UNIQUE PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);`));

// character story progress tracking
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS character_story_progress (
  character_id TEXT NOT NULL,
  story TEXT NOT NULL,
  progress INTEGER NOT NULL,
  FOREIGN KEY (character_id) REFERENCES characters (id),
  FOREIGN KEY (story) REFERENCES stories (story)
);`));  

// Create scene inventories table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS scene_inventories (
  scene_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  FOREIGN KEY (scene_id) REFERENCES scenes (id),
  FOREIGN KEY (item_id) REFERENCES items (id)
);`));

// Create user inventories table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS character_inventories (
  character_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  FOREIGN KEY (character_id) REFERENCES characters (id),
  FOREIGN KEY (item_id) REFERENCES items (id)
);`));

// Create scene descriptions table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS scene_descriptions (
  scene_id TEXT NOT NULL,
  story TEXT NOT NULL,
  progress INTEGER NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (scene_id) REFERENCES scenes (id),
  FOREIGN KEY (story) REFERENCES stories (story)
);`));

// Create scene exits table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS scene_exits (
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  description TEXT NOT NULL,
  keyword_csv TEXT NOT NULL,
  FOREIGN KEY (from_id) REFERENCES scenes (id),
  FOREIGN KEY (to_id) REFERENCES scenes (id)
);`));

statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS character_story_progress (
  character_id TEXT NOT NULL,
  story TEXT NOT NULL,
  progress INTEGER NOT NULL,
  FOREIGN KEY (character_id) REFERENCES characters (id),
  FOREIGN KEY (story) REFERENCES stories (story)
);`));

db.transaction(() => {
  while(statements.length) {
    statements.shift()?.run();
  }  
})();

/* not using these indexes for now, but here is example code of how to use them if needed later

// Create indexes

// Create user session index
statements.push(db.prepare(`CREATE INDEX IF NOT EXISTS user_session_index
  ON users (session_token);`));

// Create user name index
statements.push(db.prepare(`CREATE INDEX IF NOT EXISTS user_username_index
  ON users (username);`));

// Create scene inventories index
statements.push(db.prepare(`CREATE INDEX IF NOT EXISTS scene_inventories_index
  ON scene_inventories (scene_id);`));

// Create character inventories index
statements.push(db.prepare(`CREATE INDEX IF NOT EXISTS character_inventories_index
  ON character_inventories (character_id);`));

db.transaction(() => {
  while(statements.length) {
    statements.shift()?.run();
  }  
})();
*/
