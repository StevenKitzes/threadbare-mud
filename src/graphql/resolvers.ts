import { User } from "@/types";
import { Database } from "../../sqlite/sqlite";

type QueryContext = { database: Database };

type CharacterArgs = { characterId: string };
type ItemArgs = { itemId: string };
type SceneArgs = { sceneId: string };
type SceneInventoryArgs = { sceneId: string };
type UserArgs = {
  userId?: string;
  username?: string;
}

export const resolvers = {
  Query: {
    // returns a single object describing a character
    character: (_: any, args: CharacterArgs, context: QueryContext) => {
      return context.database.readCharacter(args.characterId);
    },

    // returns a single object describing an inventory item
    item: (_: any, args: ItemArgs, context: QueryContext) => {
      return context.database.readItem(args.itemId);
    },

    // returns a single object describing a scene
    scene: (_: any, args: SceneArgs, context: QueryContext ) => {
      return context.database.readScene(args.sceneId);
    },

    // returns a list of items that a scene has in it
    sceneInventory: (_: any, args: SceneInventoryArgs, context: QueryContext ) => {
      return context.database.readSceneInventory(args.sceneId);
    },

    // returns all meaningful user data
    user: (_: any, args: UserArgs, context: QueryContext ) => {
      const user: User | undefined =
        args.userId ? context.database.readUser(args.userId) :
          args.username ? context.database.readUserByName(args.username) :
            undefined;
      if (user === undefined) return undefined;

      user.characters = context.database.readCharactersByUserId(user.id);
      return user;
    }
  },
};

export default resolvers;
