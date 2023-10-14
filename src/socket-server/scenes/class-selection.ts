import { writeCharacterData } from '../../../sqlite/sqlite';
import getEmitters from '../../utils/emitHelper';
import { scenes, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { ClassTypes, SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';

const id: SceneIds = SceneIds.CLASS_SELECTION;
const title: string = "Select your character class";
const horseAllowed: boolean = false;
const sentiment: SceneSentiment = SceneSentiment.remote;
const publicInventory: string[] = [];

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitSelf } = getEmitters(socket, sceneId);

  if (command === 'enter') {
    // Only relevant to scenes with scene state, to set up initial state
    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    const actorText: string[] = [title, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`Choose a job/background for your character.  You can choose from among Weaver, Peacemaker, Skyguard, Ranger, Spymaster, or Common Rogue.`);
    actorText.push(`{Weavers} hail from the mysterious realm of Thayzhul.  They perfect their combat through attunement to the Lifelight, melding choreographed elements of song and dance into their techniques.`);
    actorText.push(`{Peacemakers} come from a wise, nearly extinct culture of pacifists.  They are formidable warriors, owing to an accute mental connection with the Lifelight.`);
    actorText.push(`{Skyguard} soldiers are the elite unit of the Imperial army, hailing from the Empire of the Sky in the north.  They favor heavy armor and weapons, might over magic.`);
    actorText.push(`{Rangers} roam the forests of Greenwood.  They boast no magical attunements, but long years of strife along their borders has sharpened their ability to defend their people.`);
    actorText.push(`{Spymasters}, agents of Ironhenge in the west, have a way of talking themselves into and out of all kinds of trouble.  Handy in a fight, but just as quicky to manipulate their way out of one.`);
    actorText.push(`{Common rogues} can be found throughout all the realms.  They hold no allegiance and boast not special skills, most often found pursuing nothing more than the next sack of coin.`);
    actorText.push(`Which type of character would you like to be?  Type one of these: [weaver], [peacemaker], [skyguard], [ranger], [spymaster], or [rogue].`)

    emitSelf(actorText);

    return true;
  }

  if (!Object.values(ClassTypes).includes(command as ClassTypes)) {
    emitSelf("That is not a valid class.  Please try again.", { error: true });

    return true;
  }

  let destination: SceneIds = SceneIds.COLD_BEDROOM;

  if (command === 'weaver') {
    if (writeCharacterData(character.id, {
      job: ClassTypes.weaver,
      scene_id: destination,
      light_attack: 6,
      heavy_attack: 10,
      ranged_attack: 14,
      agility: 12,
      strength: 8,
      savvy: 10
    })) {
      character.job = ClassTypes.weaver;
      character.light_attack  = 6;
      character.heavy_attack  = 10;
      character.ranged_attack = 14;
      character.agility       = 12;
      character.strength      = 8;
      character.savvy         = 10;
      emitSelf(`Welcome, Weaver ${character.name}.  May the Lifelight shine upon you along your journey.`);
    }
  } else if (command === 'peacemaker') {
    if (writeCharacterData(character.id, {
      job: ClassTypes.peacemaker,
      scene_id: destination,
      light_attack: 10,
      heavy_attack: 8,
      ranged_attack: 6,
      agility: 12,
      strength: 10,
      savvy: 14
    })) {
      character.job = ClassTypes.peacemaker;
      character.light_attack  = 10;
      character.heavy_attack  = 8;
      character.ranged_attack = 6;
      character.agility       = 12;
      character.strength      = 10;
      character.savvy         = 14;
      emitSelf(`Welcome, ${character.name}, wise Peacemaker.  May you uplift the downtrodden along your journey.`);
    }
  } else if (command === 'skyguard') {
    if (writeCharacterData(character.id, {
      job: ClassTypes.skyguard,
      scene_id: destination,
      light_attack: 8,
      heavy_attack: 14,
      ranged_attack: 10,
      agility: 6,
      strength: 12,
      savvy: 10
    })) {
      character.job = ClassTypes.skyguard;
      character.light_attack  = 8;
      character.heavy_attack  = 14;
      character.ranged_attack = 10;
      character.agility       = 6;
      character.strength      = 12;
      character.savvy         = 10;
      emitSelf(`Welcome, Master ${character.name}.  May you bring honor and glory to the Empire of the Sky!`);
    }
  } else if (command === 'ranger') {
    if (writeCharacterData(character.id, {
      job: ClassTypes.ranger,
      scene_id: destination,
      light_attack: 8,
      heavy_attack: 10,
      ranged_attack: 14,
      agility: 12,
      strength: 10,
      savvy: 6
    })) {
      character.job = ClassTypes.ranger;
      character.light_attack  = 8;
      character.heavy_attack  = 10;
      character.ranged_attack = 14;
      character.agility       = 12;
      character.strength      = 10;
      character.savvy         = 6;
      emitSelf(`Welcome, ${character.name}.  May your hand hold evil at bay.`);
    }
  } else if (command === 'spymaster') {
    if (writeCharacterData(character.id, {
      job: ClassTypes.spymaster,
      scene_id: destination,
      light_attack: 12,
      heavy_attack: 8,
      ranged_attack: 10,
      agility: 10,
      strength: 6,
      savvy: 14
    })) {
      character.job = ClassTypes.spymaster;
      character.light_attack  = 12;
      character.heavy_attack  = 8;
      character.ranged_attack = 10;
      character.agility       = 10;
      character.strength      = 6;
      character.savvy         = 14;
      emitSelf(`Welcome, ${character.name}.  May your endeavors go unnoticed.`);
    }
  } else if (command === 'rogue') {
    if (writeCharacterData(character.id, {
      job: ClassTypes.rogue,
      scene_id: destination,
      light_attack: 10,
      heavy_attack: 12,
      ranged_attack: 8,
      agility: 10,
      strength: 14,
      savvy: 6
    })) {
      character.job = ClassTypes.rogue;
      character.light_attack  = 10;
      character.heavy_attack  = 12;
      character.ranged_attack = 8;
      character.agility       = 10;
      character.strength      = 14;
      character.savvy         = 6;
      emitSelf(`Welcome, ${character.name}.  May you find coin under every stone you turn.`);
    }
  } else {
    return false;
  }

  socket.leave(sceneId);
  character.scene_id = destination;
  socket.join(destination);

  return scenes.get(destination).handleSceneCommand({
    ...handlerOptions,
    command: 'enter'
  });
}

export {
  id,
  title,
  sentiment,
  horseAllowed,
  publicInventory,
  handleSceneCommand
};
