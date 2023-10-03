import { User } from "@/types";
import { Database } from "../../sqlite/sqlite";

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

    // returns all meaningful user data
    user: (_: any, args: UserArgs, context: QueryContext ) => {
      // catch case user forgot to provide any info to find a user
      if (!args.userId && !args.username) {
        return context.database.readUser(context.user.id);
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
  User: {
    // returns a list of characters belonging to the user
    characters: ({ id }: { id: string }, _: any, context: QueryContext) => {
      return context.database.readCharactersByUserId(id);
    }
  }
};

export default resolvers;
