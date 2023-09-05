import { Statement } from 'better-sqlite3';
import db from '../../sqlite/sqlite-get-db.ts';

export type DBError = {
  error: string;
};

export type TransactBundle = {
  statement: Statement,
  runValues: any[]
}

export const transact = (bundles: TransactBundle[]): void => {
  db.transaction(() => {
    bundles.forEach(bundle => {
      bundle.statement.run(...bundle.runValues);
    })
  })();
}

export const writeScene = (id: string, name: string): TransactBundle => {
  return {
    statement: db.prepare("INSERT INTO scenes (id, name) VALUES (?, ?);"),
    runValues: [id, name]
  };
};

export const writeItem = (id: string, name: string): TransactBundle => {
  return {
    statement: db.prepare("INSERT INTO items (id, name) VALUES (?, ?);"),
    runValues: [id, name]
  };
};
