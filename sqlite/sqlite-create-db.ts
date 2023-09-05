import { Statement } from 'better-sqlite3';
import db from './sqlite-get-db.ts';

const statements: Statement[] = [];

// Drop existing tables if they exist
statements.push(db.prepare(`DROP INDEX IF EXISTS scene_inventories_index;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS scene_inventories;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS scenes;`));
statements.push(db.prepare(`DROP TABLE IF EXISTS items;`));

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

// Create scene inventories index
statements.push(db.prepare(`CREATE INDEX IF NOT EXISTS scene_inventories_index
  ON scene_inventories (scene_id);`));

db.transaction(() => {
  while(statements.length) {
    statements.shift()?.run();
  }  
})();  
