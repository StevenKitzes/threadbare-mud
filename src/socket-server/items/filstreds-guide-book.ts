import { REGEX_READ_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { captureFrom } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.FILSTREDS_GUIDE_BOOK;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = `An outsized book, with a heavy wooden hardcover, titled [${title}].  There is something fishy about it, like it doesn't fit in your hands properly.  No, more like it doesn't fit in your eyes properly.  No, it's something else...`;
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  const readMatch: string | null = captureFrom(command, REGEX_READ_ALIASES);
  if (readMatch !== null) {
    if (keywords.includes(readMatch)) {
      const actorText: string[] = [];
      actorText.push(`You open a copy of ${title}, skipping to the good bits...`);
      actorText.push(`As you open the cover and turn the pages of this book, you get two strange sensations at the same time.  One makes you feel a bit as if you are being watched.  The other gives the near-nauseating feeling that it is the world that is turning around the pages.  You are shocked to find your own name printed on the pages.`);
      actorText.push(`"Welcome, ${name}, to your life on the continent!  During your stay here, you may find it useful to have a guide to some of the many wonderful things you can get up to here.  Allow me to take you by the hand and show you some of the best."`);
      actorText.push(`"In this world, you will find that you are free to use your own words to make your way through life.  You will find suggestions highlighted throughout your journey, hinting that you may be able to [go here], [eat this],  or [fight that].  You can try these words as presented, but don't hesitate to try some other things.  You never know what might make your life a little easier, or might surprise you!  But along the same lines, be careful, and be specific!  If you are carrying a glorious steel longsword and a cheap tin rapier, and you simply say [drop sword], there's no telling which you'll let go of!  Now, onto some particulars."`);
      actorText.push(`"In this world, one of the most basic things you can do is [look] at something.  If you just [look] without specifying what you want to look at, you will end up looking at your surroundings, which is quite useful on its own.  But you can also [inspect {something}] if you want to learn more about it.  This goes for items in your environment, in your [inventory], or worn on your[self]."`);
      actorText.push(`"In this world, you can [go] places.  When you [look] at your surroundings, you will find clues as to where you can [go] from where you are.  For example, if you are standing at a crossroads and see the path stretching away toward the rising sun, you can [go east]."`);
      actorText.push(`"In this world, you can [buy] things.  Naturally, you can only buy them from people who are selling them.  Find these people, [talk] to them to learn what they are selling, and [purchase] to your heart's content!  Oh, you'll need to have the requisite funds at hand, of course.  You can check on this by perusing your [inventory].  This will also allow you to see what else you are carrying."`);
      actorText.push(`"In this world, you can [eat] things, [drink] things, and more generally, [use] things.  As you find things throughout the world, you can try to eat, drink, or use them.  Your mileage may vary when going off the rails.  I won't accept any responsibility for folks trying to eat decorative shields in the park."`);
      actorText.push(`"In this world, you will find items in the scenes you visit.  You can [get] these items to add them to your inventory.  You can only carry so much, so be careful about picking up every other thing you come across.  If you find that you are carrying too much, you can review what you are carrying by checking your [inventory], and you are free to [drop] anything you are carrying."`);
      actorText.push(`"In this world, you will find various pieces of armor, weaponry, clothing, and other items that you can [equip] or [wear].  Each of these items fits a particular part of your body.  I'm not accountable if you try to wear pants on your head, or a hat on your ... anything else, really.  If you decide you want to equip something else, you can just [equip] it and it will automatically replace what you were already wearing (returning the old item to your inventory), or if you want to wear nothing, for whatever reason, you can [remove] an item."`);
      actorText.push(`"In this world, if you want to know what things you already have equipped, or learn more about your current status, you can look at your[self].  You can learn a lot about your[self], by taking a good look at your[self]."`);
      actorText.push(`"In this world, you may want to grow your [skills] and [abilities].  You can review your [skills] and [abilities], of course, and you can also, separately, improve their [level].  By checking on the [level] of energy you've gathered from the Lifelight, you can see how much you need to improve any of your skills or abilities."`);
      actorText.push(`"In this world, you might come across people or creatures you don't like very much.  In fact, you might come across some that you dislike enough that you want to end their lives, for what I can only imagine would be perfectly legal and justifiable reasons.  In this case, you can [fight] them.  But be careful with this, because if you lose, the Lifelight will send you back to the last place you took a [rest]."`);
      actorText.push(`"In this world, your health can suffer if you take on too many injuries from your various fights and adventures.  If you need to, you can find places to [sleep].  These will usually have beds or other indications that there are good accommodations for taking a [rest].  Having a [rest] will restore your health."`);
      actorText.push(`"In this world, you might obtain items that you want to [give] to someone.  For example, someone might give you something in the hopes you'll be their courier.  This is one of the most complicated things you can do in this world, since you have to [give {items} to ~someone~]."`);
      actorText.push(`"In this world, you may find yourself in companionship with a four-legged friend, a pack animal that can help carrying things for you.  In this case, you can [give {items} to ~them~].  Be careful, as your horse can only carry a limited amount, dictated by the quality of saddlebags they are carrying.  If you want to retrieve something from your horse, you can [get {items} from ~them~].  You can do a lot with your horse - give your horse a [look] to learn more about them.  Beware, your horse will not follow you some places, such as indoors, so make sure you manage your inventory while you are together."`);
      actorText.push(`"In this world, you may end up with jobs to do or [quests] to go on.  If you need to refresh your memory, you can always stop and think about what [missions] you have chosen to undertake, and what [stories] you are involved in."`);
      actorText.push(`"In this world, you will encounter books, scrolls, notes, and other written works.  However, if you are already here, I trust you to know how to [read] something."  The book almost seems to wink at you, somehow.`);
      actorText.push(`"In this world, you'll most likely encounter people or creatures you'd like to learn from or interact with, other than to kill them.  You can [speak] with them to see if they'll talk back.  They may not, but some will."`);
      actorText.push(`"That should be enough to get you started.  May the Lifelight illuminate your path and warm your weary bones!"`);
      emitOthers(`${name} opens a copy of ${title} and starts reading.`);
      emitSelf(actorText);
      return true;
    }
  }
};

function randomizeValue (): number {
  return value = itemPriceRandomizer(csvData.value);
}

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  randomizeValue,
  weight,
  handleItemCommand
};
