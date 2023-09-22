import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    "Query to get a character"
    character(characterId: String!): Character!
    "Query to get an inventory item"
    item(itemId: String!): Item!
    "Query to get a scene"
    scene(sceneId: String!): Scene!
    "Query to get the inventory for a scene along with the scene's information"
    sceneInventory(sceneId: String!): SceneInventory!
    "Query to get a user"
    user(userId: String, username: String): User!
  }

  "A character owned by a user, possessing an inventory, and so on"
  type Character {
    "The id string representing a character"
    id: String!,
    "The name of the character being queried"
    name: String!,
    "The scene location the character is currently located"
    scene_id: String!,
    "Whether this character is the one the user is currently playing with, 0 is false and 1 is true"
    active: Int!,
  }

  "A item refers to an inventory item that can belong to a room or character"
  type Item {
    id: String!
    "The item's name"
    name: String!
  }

  "A scene represents a room or other location a character can visit"
  type Scene {
    id: String!
    "The name describing the location independent of its state"
    name: String!
  }

  "A scene and whatever items it currently possesses"
  type SceneInventory {
    "Information about the scene whose inventory we are retrieving"
    scene: Scene!
    "The inventory of items present at the scene"
    inventory: [Item]
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
