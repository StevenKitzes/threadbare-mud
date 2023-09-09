const dbToHydrate = require('./sqlite-get-db.ts');

const uuid = require('uuid').v4;

dbToHydrate.transaction(() => {
  const sceneId: string = uuid();
  const itemId: string = uuid();

  const userId: string = uuid();

  dbToHydrate
    .prepare("INSERT INTO scenes (id, name) VALUES (?, ?);")
    .run(sceneId, 'A normal room.');
  dbToHydrate
    .prepare("INSERT INTO items (id, name) VALUES (?, ?);")
    .run(itemId, 'A normal item.');
  dbToHydrate
    .prepare("INSERT INTO scene_inventories (scene_id, item_id) VALUES (?, ?);")
    .run(sceneId, itemId);
  dbToHydrate
    .prepare("INSERT INTO users (id, username, password, email, session_token, session_expiry) VALUES (?, ?, ?, ?, ?, ?);")
    .run(userId, 'admin', 'admin', 'winds23@gmail.com', 'token', '0');
})();
