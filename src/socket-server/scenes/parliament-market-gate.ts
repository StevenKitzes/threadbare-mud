import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { Navigable, navigate, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { Faction, SceneSentiment } from '../../types';
import { commandMatchesKeywordsFor, makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from '../../constants';
import items, { ItemIds } from '../items/items';
import { npcImports } from '../npcs/csvNpcImport';
import { handleFactionAggro } from '../../utils/combat';
import { writeCharacterData } from '../../../sqlite/sqlite';
import { firstUpper } from '../../utils/firstUpper';
import { isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.PARLIAMENT_MARKET_GATE;
const title: string = "Parliament Market Gate";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_MARKET_GATE,
    keywords: "n north market marketplace".split(' '),
    departureDescription: (name: string) => `${name} walks off north, toward another part of the market.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_MARKET_SQUARE,
    keywords: "w west market square".split(' '),
    departureDescription: (name: string) => `${name} heads west, into the Market Square.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_SOUTHEAST_MARKET,
    keywords: "s south market marketplace".split(' '),
    departureDescription: (name: string) => `${name} heads south, deeper still into the market.`,
  },
];

const characterNpcs: Map<string, NPC[]> = new Map<string, NPC[]>();
const getSceneNpcs = (): Map<string, NPC[]> => characterNpcs;

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

  if (command === 'enter') {
    // Only relevant to scenes with npcs, to set up npc state
    if (!characterNpcs.has(character.id)) {
      // Populate NPCs
      characterNpcs.set(character.id, [ npcFactory({
        csvData: npcImports.get(NpcIds.PEACEKEEPER_CAPTAIN),
        character,
        lootInventory: [ ItemIds.PEACEKEEPER_LONGSWORD ],
      }) ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.getDeathTime() && Date.now() - new Date(c.getDeathTime()).getTime() > 600000) c.setHealth(c.getHealthMax());
      })
    }

    handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    });

    handleFactionAggro(characterNpcs, character, handlerOptions, emitOthers, emitSelf);

    return true;
  }

  // Only relevant to scenes with npcs, delete otherwise
  const sceneNpcs: NPC[] = characterNpcs.get(character.id);
  for (let i = 0; i < sceneNpcs.length; i++) if (sceneNpcs[i].handleNpcCommand(handlerOptions)) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around at the architectural magnificence of the Market Gate.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`Here stands a magnificent archway, a marvel of engineering for its time.  It is decorative, meant only to display the wealth and stature of the township that would one day become Parliament.  In those ancient times, the town border ended at the archway.  Later, the archway became a symbolic marker for the edge of Parliament's market square.  Now, the market spills even beyond the archway into town.`);
    actorText.push(`Also standing here is a small guard post for the peacekeepers.  A [sign] is posted here, with a drawing of a dead rat on it, along with some text.  An [officer] is posted here as well.  He beckons you over to him.`);
    actorText.push(`To the [north] and [south], the marketplace sprawls onward.  To the [west] lies the spectacular Market Square proper.  And [east] of the arch, Parliament's residential quarter begins.`);
    appendSentimentText(character.job, sentiment, actorText);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    characterNpcs.get(character.id).forEach(npc => actorText.push(npc.getDescription()));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  if (commandMatchesKeywordsFor(command, ['officer', 'peacekeeper', 'guard'], REGEX_TALK_ALIASES)) {
    emitOthers(`${name} approaches the guard post to chat with a peacekeeper officer.`);
    emitSelf(`The peacekeeper officer jerks his head at the sign with the picture of the dead rat.  "You look like the enterprising sort.  Wanna make a few coins?  Help us out with the city's rodent problem.  We'll pay 5 coins for every dead varmint you drag in."`);
    return true;
  }

  if (commandMatchesKeywordsFor(command, ['officer', 'peacekeeper', 'guard'], REGEX_LOOK_ALIASES)) {
    emitOthers(`${name} eyes the guard post and the peacekeeper officer within.`);
    emitSelf(`The peacekeeper officer stationed at the guard post has seen better days.  He appears a little unkempt, his uniform a little disheveled, his beard a little unshaven.  Maybe he has been stationed here for too long.`);
    return true;
  }

  if (commandMatchesKeywordsFor(command, ['sign', 'rat'], REGEX_LOOK_ALIASES)) {
    emitOthers(`${name} reads the sign affixed to the guard post.`);
    emitSelf(`The sign with the picture of the dead rat on it offers 5 coins for every dead rat you bring in.  This guard post is a place where you can [sell dead rats] you may have collected.`);
    return true;
  }

  if (commandMatchesKeywordsFor(command, ['dead', 'rat', 'rats', 'rodent', 'rodents'], 'sell')) {
    for (let i = 0; i < character.factionAnger.length; i++) {
      if (character.factionAnger[i].faction === Faction.PARLIAMENT) {
        emitOthers(`${name} approaches the guard post to hand in some dead rats, but is turned away due to poor standing with ${firstUpper(character.factionAnger[i].faction)}.`);
        emitSelf(`The peacekeeper officer frowns.  "Sorry, friend, can't do business with you while you're on such poor terms with ${firstUpper(character.factionAnger[i].faction)}."`);
        return true;
      }
    }

    let ratCount: number = 0;
    const newInventory: ItemIds[] = [ ...character.inventory ];
    for (let i = newInventory.length - 1; i >= 0; i--) {
      if (items.get(newInventory[i]).id === ItemIds.DEAD_RAT) {
        ratCount++;
        newInventory.splice(i, 1);
      }
    }
    
    if (writeCharacterData(character, {
      inventory: newInventory,
      money: character.money + (5 * ratCount) })
    ) {
      emitOthers(`${name} approaches the guard post to hand in some dead rats.`);
      emitSelf(`You hand in ${ratCount} dead rat${ratCount !== 1 ? 's' : ''}, and in exchange, the peacekeeper officer hands you ${ratCount * 5} coins.`);
      return true;
    }
    
  }

  if (isAmbiguousNavRequest(handlerOptions, navigables)) return true;
  for (let i = 0; i < navigables.length; i++) {
    if (navigate(
      handlerOptions,
      navigables[i].sceneId,
      navigables[i].keywords,
      emitOthers,
      navigables[i].departureDescription(name),
      navigables[i].extraActionAliases,
    )) return true;
  }

  return false;
}

export {
  id,
  title,
  sentiment,
  horseAllowed,
  publicInventory,
  navigables,
  handleSceneCommand,
  getSceneNpcs
};
