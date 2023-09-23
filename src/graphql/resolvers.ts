import { User } from "@/types";
import { Database } from "../../sqlite/sqlite";
import jStr from "@/utils/jStr";

type QueryContext = { database: Database, user: User };

type CharacterArgs = { characterId: string };
type ItemArgs = { itemId: string };
type SceneArgs = { sceneId: string };
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

    // returns all meaningful user data
    user: (_: any, args: UserArgs, context: QueryContext ) => {
      // catch case user forgot to provide any info to find a user
      if (!args.userId && !args.username) {
        throw new Error("No identifier provided for user authentication.");
      }
      
      const isAdmin = context.user.username === "admin";

      // ensure auth
      if (args.userId && (isAdmin || args.userId === context.user.id)) {
        return context.database.readUser(args.userId);
      } else if (args.username && (isAdmin || args.username === context.user.username)) {
        return context.database.readUserByName(args.username);
      } else {
        throw new Error("Unable to verify user authentication in data request.");
      }
    }
  },
  Character: {
    // returns a single object describing this character's scene
    scene: ({ scene_id }: { scene_id: string }, _: any, context: QueryContext) => {
      return context.database.readScene(scene_id);
    },

    // returns the items this character is holding
    inventory: ({ id }: { id: string }, _: any, context: QueryContext) => {
      return context.database.readCharacterInventory(id);
    }
  },
  Scene: {
    // returns the items present in this scene
    inventory: ({ id }: { id: string }, _: any, context: QueryContext) => {
      return context.database.readSceneInventory(id);
    },

    // returns a list of ways out of the room
    exits: ({ id }: { id: string }, _: any, context: QueryContext) => {
      return context.database.readSceneExits(id);
    }
  },
  User: {
    // returns a list of characters belonging to the user
    characters: ({ id }: { id: string }, _: any, context: QueryContext) => {
      return context.database.readCharactersByUserId(id);
    }
  }
};

export default resolvers;
