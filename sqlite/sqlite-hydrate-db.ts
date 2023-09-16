const dbToHydrate = require('./sqlite-get-db.ts');

const uuid = require('uuid').v4;

dbToHydrate.transaction(() => {
  const sceneId: string = uuid();
  const itemIds: string[] = [uuid(), uuid(), uuid()];

  const userId: string = uuid();

  dbToHydrate
    .prepare("INSERT INTO scenes (id, name) VALUES (?, ?);")
    .run(sceneId, 'A normal room.');
  dbToHydrate
    .prepare("INSERT INTO items (id, name) VALUES (?, ?);")
    .run(itemIds[0], 'A normal item.');
  dbToHydrate
    .prepare("INSERT INTO items (id, name) VALUES (?, ?);")
    .run(itemIds[1], 'An abnormal item.');
  dbToHydrate
    .prepare("INSERT INTO items (id, name) VALUES (?, ?);")
    .run(itemIds[2], 'A truly unusual item.');
  dbToHydrate
    .prepare("INSERT INTO scene_inventories (scene_id, item_id) VALUES (?, ?);")
    .run(sceneId, itemIds[0]);
  dbToHydrate
    .prepare("INSERT INTO scene_inventories (scene_id, item_id) VALUES (?, ?);")
    .run(sceneId, itemIds[1]);
  dbToHydrate
    .prepare("INSERT INTO scene_inventories (scene_id, item_id) VALUES (?, ?);")
    .run(sceneId, itemIds[2]);
  dbToHydrate
    .prepare("INSERT INTO users (id, username, password, email, session_token, session_expiry) VALUES (?, ?, ?, ?, ?, ?);")
    .run(userId, 'admin', 'admin', 'winds23@gmail.com', 'token', '0');
})();
