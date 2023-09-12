const { Statement } = require('better-sqlite3');
const db = require('./sqlite-get-db.ts');

const statements: typeof Statement[] = [];

// Drop existing tables if they exist
statements.push(db.prepare(`DROP INDEX IF EXISTS scene_inventories_index;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS scene_inventories;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS scenes;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS items;`));
statements.push(db.prepare(`DROP INDEX IF EXISTS user_session_index;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS users;`));

// Create users table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id TEXT UNIQUE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  salt TEXT NOT NULL,
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

// Create items table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS items (
  id TEXT UNIQUE PRIMARY KEY,
  name TEXT NOT NULL
);`));

// Create scene inventories table
statements.push(db.prepare(`CREATE TABLE IF NOT EXISTS scene_inventories (
  scene_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  FOREIGN KEY (scene_id) REFERENCES scenes (id),
  FOREIGN KEY (item_id) REFERENCES items (id)
);`));

db.transaction(() => {
  while(statements.length) {
    statements.shift()?.run();
  }  
})();

// Create indexes

// Create user session index
statements.push(db.prepare(`CREATE INDEX IF NOT EXISTS user_session_index
  ON users (session_token);`));

// Create scene inventories index
statements.push(db.prepare(`CREATE INDEX IF NOT EXISTS scene_inventories_index
  ON scene_inventories (scene_id);`));

db.transaction(() => {
  while(statements.length) {
    statements.shift()?.run();
  }  
})();
