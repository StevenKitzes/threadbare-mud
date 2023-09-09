const Database = require('better-sqlite3');

const SQLiteDB = new Database('threadbare.db', {});
SQLiteDB.pragma('journal_mode = WAL');

module.exports = SQLiteDB;
