import { Character } from "../types";

// get a list of characters that are in the room with the player
export const appendAlsoHereString = (actorText: string[], character: Character, characterList: Map<string, Character>): void => {
  const alsoHereNames: string[] = [];

  characterList.forEach((char: Character) => {
    if (character.scene_id === char.scene_id && character.id !== char.id) alsoHereNames.push(char.name);
  });

  if (alsoHereNames.length === 1) actorText.push(`${alsoHereNames[0]} is also here.`);

  if (alsoHereNames.length > 1) {
    actorText.push(`${alsoHereNames.map((char, idx) => {
      // if last in list
      if (idx === alsoHereNames.length - 1) {
        return `and ${char}`;
      } else {
        return `${char},`
      }
    }).join(' ')} are also here.`);
  }
}


export default appendAlsoHereString;
