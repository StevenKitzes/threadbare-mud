import db from './sqlite-get-db.ts';

import { v4 as uuid } from 'uuid';

db.transaction(() => {
  const sceneId: string = uuid();
  const itemId: string = uuid();

  db
    .prepare("INSERT INTO scenes (id, name) VALUES (?, ?);")
    .run(sceneId, 'A normal room.');
  db
    .prepare("INSERT INTO items (id, name) VALUES (?, ?);")
    .run(itemId, 'A normal item.');
  db
    .prepare("INSERT INTO scene_inventories (scene_id, item_id) VALUES (?, ?);")
    .run(sceneId, itemId);
})();
