import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    "Query to get an inventory item"
    item(itemId: String): Item!
    "Query to get a scene"
    scene(sceneId: String): Scene!
    "Query to get the inventory for a scene along with the scene's information"
    sceneInventory: SceneInventory!
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
`;

export default typeDefs;
