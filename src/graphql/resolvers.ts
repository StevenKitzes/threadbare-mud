import { Database } from "../../sqlite/sqlite";

type QueryContext = { database: Database };

type ItemArgs = { itemId: string };
type SceneArgs = { sceneId: string };

export const resolvers = {
  Query: {
    // returns a single object describing an inventory item
    item: (_: any, args: ItemArgs, context: QueryContext) => {
      return context.database.readItem(args.itemId);
    },

    // returns a single object describing a scene
    scene: (_: any, args: SceneArgs, context: QueryContext ) => {
      return context.database.readScene(args.sceneId);
    },
  },
};

export default resolvers;
