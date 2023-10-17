const { Statement } = require('better-sqlite3');
const db = require('./sqlite-get-db.ts');

const statements: typeof Statement[] = [];

// Drop existing tables if they exist
statements.push(db.prepare(`DROP TABLE IF EXISTS characters;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS users;`));

// Create users table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id TEXT UNIQUE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  session TEXT
);`));

// characters owned by users
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS characters (
  id TEXT UNIQUE PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT UNIQUE NOT NULL,

  job TEXT,
  health INTEGER NOT NULL,
  health_max INTEGER NOT NULL,
  light_attack INTEGER NOT NULL,
  heavy_attack INTEGER NOT NULL,
  ranged_attack INTEGER NOT NULL,
  agility INTEGER NOT NULL,
  strength INTEGER NOT NULL,
  savvy INTEGER NOT NULL,

  scene_id TEXT NOT NULL,
  checkpoint_id TEXT NOT NULL,
  active INTEGER NOT NULL,
  stories TEXT NOT NULL,
  scene_states TEXT NOT NULL,
  money INTEGER NOT NULL,
  inventory TEXT NOT NULL,
  headgear TEXT,
  armor TEXT,
  gloves TEXT,
  legwear TEXT,
  footwear TEXT,
  weapon TEXT,
  offhand TEXT,
  xp INTEGER NOT NULL,
  horse TEXT,
  faction_anger TEXT NOT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users (id)
);`));

db.transaction(() => {
  while(statements.length) {
    statements.shift()?.run();
  }  
})();
