import { writeCharacterData } from '../../../sqlite/sqlite';
import { REGEX_GET_ALIASES, REGEX_LOOK_ALIASES, REGEX_REST_ALIASES } from '../../constants';
import { SceneSentiment } from '../../types';
import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { commandMatchesKeywordsFor, makeMatcher } from '../../utils/makeMatcher';
import items, { ItemIds } from '../items/items';
import { SceneIds, navigate } from '../scenes/scenes';
import { HandlerOptions } from '../server';

const id: SceneIds = SceneIds.COLD_BEDROOM;
const title: string = "A cold bedroom";
const sentiment: SceneSentiment = SceneSentiment.remote;
const horseAllowed: boolean = false;
const publicInventory: ItemIds[] = [];
const initialSceneState: any = {
  daggerHere: true,
  outfitHere: true
};

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

  if (command === 'enter') {
    if (character.stories.main === 0) emitOthers(`${character.name} awakens from a long slumber.`);
    else emitOthers(`${character.name} steps into the bedroom.`);

    if (!character.scene_states.hasOwnProperty(id)) {
      const newSceneState: any = { ...character.scene_states };
      newSceneState[sceneId] = initialSceneState;
      if (writeCharacterData(character.id, { scene_states: newSceneState })) {
        character.scene_states[id] = initialSceneState;
      }
    }
    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around the bedroom.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    if (
      character.stories.main === 0 &&
      writeCharacterData(character.id, { stories: { ...character.stories, main: 1 } })
    ) {
      character.stories.main = 1;
      actorText.push("You awaken to the feeling of satin sheets against your skin and a comfortable mattress beneath you.  You hear voices, a whole grandiose chorus of them, singing a song that seems to fall from its crescendo just as you are coming to your senses.  As your thoughts begin to coalesce, you realize that you have no memory of how you came to be where you are.  In fact, you aren't even sure who you are, beyond a name that rings in the corner of your mind:");
      actorText.push(`${name}.`);
    } else if (character.stories.main > 0) {
      actorText.push("This was the room where you awoke on satin sheets.  You recall hearing singing voices and a song that made your skin tingle.");
    }
    actorText.push('The cold, stone walls of this bedroom are plain and unadorned.  The uneven blocks were clearly cut and polished to form a smooth surface, but retain their natural outline, forming a strange mosaic with many mortar-filled gaps.  A simple table stands next to a bed, where you can [rest].  A chest of [drawers] rests against the far wall.  A [window] set into the stone across from the bed has been left cracked open, and a gentle breeze rustles the thin curtains hanging there.  A needlessly large [door], made of dark, iron-bound wood, appears to be the only exit from the room.');
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);

    emitSelf(actorText);

    return true;
  }

  if (
    command.match(makeMatcher(REGEX_REST_ALIASES)) &&
    writeCharacterData(character.id, { health: character.health_max, checkpoint_id: id })
  ) {
    character.health = character.health_max;
    character.checkpoint_id = id;
    emitOthers(`${character.name} rests for a while on a bed with satin sheets.`);
    emitSelf(`You rest a while on a bed with satin sheets, and feel rejuvenated.`);
    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  if (commandMatchesKeywordsFor(command, ['drawer', 'drawers', 'chest'], REGEX_LOOK_ALIASES)) {
    emitOthers(`${name} investigates a chest of drawers.`);

    const actorText: string[] = [];
    if (character.scene_states[id].outfitHere)
      actorText.push('An [outfit] made of black cloth and leather rests in a drawer.');
    if (character.scene_states[id].daggerHere)
      actorText.push('You find a [simple dagger] lurking in a drawer.');
    if (!character.scene_states[id].outfitHere && !character.scene_states[id].daggerHere)
      actorText.push('The drawers are bare, empty but for some lingering dust.');

    emitSelf(actorText);

    return true;
  }

  if (
    commandMatchesKeywordsFor(command, ['outfit', 'clothes', 'clothing', 'black'], REGEX_LOOK_ALIASES) &&
    character.scene_states[id].outfitHere
  ) {
    emitOthers(`${name} inspects a black outfit.`);
    emitSelf("This outfit, made of black cloth and leather, includes a tunic, pants, boots, and a black headband.");
    return true;
  }

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES, 'window'))) {
    emitOthers(`${name} peeks out the window.`);
    emitSelf("The view out the window is dizzying.  A bustling town lies below, far below . . . so far below that it is difficult to make out individual people through the clouds.  Rooftops sprawl away in all directions.  An expanse of farmlands lays beyond, and in the farther distance, mountains and an ocean are visible.  In the near distance, four other towers (like the one you must be standing in now) rise like spires into the sky.");
    return true;
  }

  if (commandMatchesKeywordsFor(command, ['door', 'wooden', 'wood', 'heavy'], REGEX_LOOK_ALIASES)) {
    emitOthers(`${name} inspects a heavy wooden door.`);
    emitSelf("The door is near twice as tall as it needs to be for someone to pass comfortably through, and wider than necessary, as well.  A mark of luxury?  You wouldn't think so, considering the crude iron binding that holds it together, or the lack of any ornamentation.");
    return true;
  }

  if (commandMatchesKeywordsFor(command, ['outfit', 'clothes', 'clothing', 'black'], REGEX_GET_ALIASES)) {
    if (character.scene_states[id].outfitHere) {
      const newInventory: ItemIds[] = [
        ...character.inventory,
        ItemIds.BLACK_HEADBAND,
        ItemIds.LOOSE_BLACK_TUNIC,
        ItemIds.LOOSE_BLACK_PANTS,
        ItemIds.SOFT_BLACK_BOOTS
      ];
      const newSceneStates: any = { ...character.scene_states };
      newSceneStates[id] = { ...newSceneStates[id], outfitHere: false };
      if (writeCharacterData(character.id, {
        inventory: newInventory,
        scene_states: newSceneStates
      })) {
        character.inventory = newInventory;
        character.scene_states = newSceneStates;
        emitOthers(`${character.name} digs a black outfit out of the chest of drawers.`);
        emitSelf([
          'You retrieve the outfit from the chest of drawers.',
          'Check your [inventory] to see what you have picked up.'
        ]);
        return true;
      }
    }
  }

  if (commandMatchesKeywordsFor(command, items.get(ItemIds.SIMPLE_DAGGER).keywords, REGEX_GET_ALIASES)) {
    if (character.scene_states[id].daggerHere) {
      const newInventory: ItemIds[] = [
        ...character.inventory,
        ItemIds.SIMPLE_DAGGER
      ];
      const newSceneStates: any = { ...character.scene_states };
      newSceneStates[id] = { ...newSceneStates[id], daggerHere: false };
      if (writeCharacterData(character.id, {
        inventory: newInventory,
        scene_states: newSceneStates
      })) {
        character.inventory = newInventory;
        character.scene_states = newSceneStates;
        emitOthers(`${character.name} pulls a simple dagger out of the chest of drawers.`);
        emitSelf('You retrieve the simple dagger from the chest of drawers.');
        return true;
      }
    }
  }

  if (navigate(
    handlerOptions,
    SceneIds.MAGNIFICENT_LIBRARY,
    'heavy wooden door library'.split(' '),
    emitOthers,
    `${name} departs through a heavy wooden door.`,
    'open'
  )) return true;

  return false;
}

export {
  id,
  title,
  sentiment,
  horseAllowed,
  publicInventory,
  handleSceneCommand
};
