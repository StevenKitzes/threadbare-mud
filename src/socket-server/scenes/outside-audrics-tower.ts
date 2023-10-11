import { navigateCharacter, writeCharacterStory } from '../../../sqlite/sqlite';
import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { scenes, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { ClassTypes, SceneSentiment } from '../../types';

const id: SceneIds = SceneIds.OUTSIDE_AUDRICS_TOWER;
const title: string = "Outside Audric's Tower";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const publicInventory: string[] = [];

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

  if (command === 'enter') {
    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (command === 'look') {
    emitOthers(`${character.name} gazes about outside the tower.`);

    const actorText: string[] = [title, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`From outside the front door of Audric's [tower], you realize both that it is, in fact, a tower, and that it is dizzyingly tall.  You are unable to make out its pinnacle.  You also realize that there is wizardry afoot.  The stairs inside are by far too few to account for the height of the window from the bedroom in which you once awoke.`);
    actorText.push(`Surrounding the base of the tower is a bustling marketplace, full of [shoppers], [merchants], horses, horse carts, bazaar stalls, and passersby.  A dense [cityscape] blocks your view of the horizon in every direction.`);
    switch (character.job) {
      case ClassTypes.peacemaker:
        actorText.push("As folk pass you by, their eyes linger on you for a moment, curiosity getting the better of them as they behold your ashen, Peacemaker complexion.  You realize that there are no others of your ilk in this crowd.");
        break;
      case ClassTypes.rogue:
      case ClassTypes.ranger:
      case ClassTypes.spymaster:
        actorText.push("Most people here are too busy to pay you any mind as they rush from task to task, place to place.");
        break;
      case ClassTypes.skyguard:
        actorText.push("People give you mixed reactions as they pass you by.  Some stare wide-eyed, as if in fear.  Others gaze at your muscles, perhaps impressed.  Others still look on with something akin to anger.  The rest don't seem to know what to make of you.  One thing is for certain, you are the only Skyguard like yourself among this crowd.");
        break;
      case ClassTypes.weaver:
        actorText.push("When folk catch a glimpse of you, they seem to pause, mesmerized by the shifting colors that glide across your Weaver skin.  You notice there are none like yourself among the crowd.");
        break;
    }
    actorText.push(`From here, you can return to Audric's [tower], head deeper into the [market], or head round the tower.  You can follow a small road to the [north] or a larger road to the [south].`);

    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  if (command.match(/^look tower$/)) {
    emitOthers(`${character.name} gazes up at the dizzying heights of the tower.`);

    emitSelf(`You experience a sense of vertigo, so tall is the tower.  Its zenith is lost in the clouds, high above.  The blocks that constitute the walls are of irregular shapes; though their outer surface and the mortar that binds them together have been smoothed so that the tower has a sleek demeanor.  There are windows and accents of dark wood and silvery metal, but these are so high above you that they are hard to make out.`);

    return true;
  }

  if (command.match(/^look shoppers$/)) {
    emitOthers(`${character.name} looks around at all the bustling shoppers.`);

    emitSelf(`As you eye the folk bustling about outside Audric's tower, you get an idea for what kind of people live in this city - at least in Audric's district.  By and large, they are well-to-do, elegantly dressed in vibrant colors.  Some have servants in tow.  The odd glance aside, they have little time to spare for you.`);

    return true;
  }

  if (command.match(/^look merchants$/)) {
    emitOthers(`${character.name} looks at the busy merchants.`);

    emitSelf(`The merchants here are selling all sorts of things.  It's hard to discern too many details from a distance without going deeper into the marketplace, but you see stalls offering food, clothing, trinkets, raw materials, printed publications, just about anything you could imagine.`);

    return true;
  }

  if (command.match(/^look (?:city|cityscape|buildings)$/)) {
    emitOthers(`${character.name} looks around at the city.`);

    emitSelf(`The buildings here are varied, though they follow a cohesive style.  They are built on wooden frames, so the beams are proudly displayed, and in some cases painted with bright, colorful patterns.  The walls between the beams are plastered white, and host generously sized windows.  Most are two to three stories tall, and they are separated by a grid of roads and narrow alleys.  The city is remarkably well-kept, a testament to the money of which this place reeks.`);

    return true;
  }

  let destination: SceneIds;

  destination = SceneIds.CURVING_STONE_STAIRCASE;
  if (command.match(/^go (?:tower|stairs|staircase|inside)$/) && navigateCharacter(character.id, destination)) {
    emitOthers(`${character.name} disappears into Audric's tower.`);

    socket.leave(sceneId);
    character.scene_id = destination;
    socket.join(destination);

    return scenes.get(destination).handleSceneCommand({
      ...handlerOptions,
      command: 'enter'
    });
  }

  destination = SceneIds.NORTH_OF_AUDRICS_TOWER;
  if (command.match(/^go north$/) && navigateCharacter(character.id, destination)) {
    emitOthers(`${character.name} around Audric's tower to the north.`);

    socket.leave(sceneId);
    character.scene_id = destination;
    socket.join(destination);

    return scenes.get(destination).handleSceneCommand({
      ...handlerOptions,
      command: 'enter'
    });
  }

  destination = SceneIds.SOUTH_OF_AUDRICS_TOWER;
  if (command.match(/^go south$/) && navigateCharacter(character.id, destination)) {
    emitOthers(`${character.name} around Audric's tower to the south.`);

    socket.leave(sceneId);
    character.scene_id = destination;
    socket.join(destination);

    return scenes.get(destination).handleSceneCommand({
      ...handlerOptions,
      command: 'enter'
    });
  }

  return false;
}

export {
  id,
  title,
  sentiment,
  publicInventory,
  handleSceneCommand
};
