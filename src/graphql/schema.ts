import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    "Query to get a character"
    character(characterId: String!): Character!
    "Query to get an inventory item"
    item(itemId: String!): Item!
    "Query to get a scene"
    scene(sceneId: String!): Scene!
    "Query to get a user"
    user(userId: String, username: String): User!
  }

  "A character owned by a user, possessing an inventory, and so on"
  type Character {
    "The id string representing a character"
    id: String!
    "The name of the character being queried"
    name: String!
    "The scene location the character is currently located"
    scene_id: String!
    "Scene information for the character's location"
    scene: Scene
    "Whether this character is the one the user is currently playing with, 0 is false and 1 is true"
    active: Int!
    "Any items that might be owned by this character"
    inventory: [Item]
  }

  "A way to travel out of a room"
  type Exit {
    "The scene id where the character currently is"
    fromId: String!
    "The scene id of a possible place the character can go"
    toId: String!
    "A desciption of the exit/path"
    description: String!
    "Possible keywords the user can enter to use this exit"
    keywords: [String]!
  }

  "A item refers to an inventory item that can belong to a room or character"
  type Item {
    id: String!
    "The item's name"
    name: String!
    "A more detailed description of the item"
    description: String!
  }

  "A scene represents a room or other location a character can visit"
  type Scene {
    id: String!
    "The name describing the location independent of its state"
    name: String!
    "Items located in a scene"
    inventory: [Item]!
    "Exits from this room"
    exits: [Exit]!
  }

  "A user account"
  type User {
    "A unique ID representing the user"
    id: String!
    "The account name decided by the user"
    username: String!
    "The user's email address"
    email: String!
    "Any characters the user owns"
    characters: [Character]
  }
`;

export default typeDefs;
