import { REGEX_READ_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { captureFrom } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import items, { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.THE_FIVE_REALMS_BOOK;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = `A book titled [${title}].  It looks to be on the newer side, suggesting it was recently enough printed to be of relevance.`;
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
      actorText.push(`"The name given to the western realms, as a group, is The Five Realms of the Drear.  The name comes from two important facts.  Firstly, there are five realms.  Secondly, the folk who live in them are mere humans and possess no special magical abilities or traits.  While this is considered common knowledge among the people of these realms - and beyond - academics consider it both a casual, and an incorrect, name for the region, for two main reasons.  For one, the people of these realms are not, in fact, forbidden or unable to use magic.  Take, for example, the nation of Ixpanne, famous for its long line of wizards and magical research.  And this being the case, we must thusly include the two other realms in which humans live and may or may not use magic: the Empire of the Sky and Thayzhul.  This would total seven, not five, and no longer be much of a 'Drear', but the two contesting realms take umbrage at the notion, and so we must digress.  For the sake of this text, let us assume there are Five Realms of the Drear"`);
      actorText.push(`"In the northwest, we find the nation of Rocksteppe.  Barren, desolate, and remote, the realm engages in few conflicts and comes under little scrutiny.  It produces few exports, and consumes little, the scant few people who live there subsisting on their flocks, and the sparse pastures on which they graze.  The soil is rocky and sandy, the bedrock shallow, and farming is difficult.  The origin of the name of the nation, you can then surely deduce.  The land is rich not for mineral, nor plant, nor animal, and there is little there to warrant military interest, and so the nation has escaped turmoil for much of its history."`);
      actorText.push(`"To the northeast lies Florenza, a capital and beneficiary of trade.  Its merchants have grown wealthy by fostering a peaceable relationship between the so-called Five Realms, and the Empire of the Sky to the more distant northeast.  While relations between the Five Realms and the Empire continue to deteriorate (see my fabulous companion text, '${items.get(ItemIds.REALM_GUIDE_BOOK).title}'), trade must persist so that civilization may continue to flourish, and Florenza has capitalized on this effect to fabulous, opulent success.  It is, though, Florenza that would be next in line for domination if the Empire were to continue its expansion westward, which quietly troubles many in the region."`);
      actorText.push(`"Most centrally located among the Five Realms is Ixpanne.  Billing itself as the Jewel of the West, this realm appears on the surface to be the most successful.  Beneath the surface, however, the truth of the matter lies in the fact that the nation's leadership commands her course by way of fear.  That applies both to the citizenry - kept in line by a notorious retinue of authoritarian peacekeepers - and Ixpanne's neighbors, who play nicely only for fear of the mighty wizards who reside at Parliament, the capital.  Ixpanne has, by way of this fear, manipulated its surrounding nations to buffer it against threats that might have come from outside the Five Realms.  Ixpanne's one weakness, if it can be said to have one, is that it is the only among the modern realms to be well and truly landlocked."`);
      actorText.push(`"To the southwest rests the realm of Ironhenge.  The land along this western reach of the continent is rich in iron - for which the nation is named - the region is also unusually rich in many other precious and semi-precious minerals.  Thus, while Florenza gathers wealth through trade, and Ixpanne commands success and wealth through fear and political domination, Ironhenge can produce its own wealth right out of the earth.  Excellent works are produced there, and the nation is a manufacturing center like none other.  Apropos of nothing, the nation developed, some decades ago, what is now considered the first and most successful organized espionage corps and training program of any nation.  It is to their chagrin that anyone knows this, though it is an open secret that they continue to set the standard in this domain."`);
      actorText.push(`"Finally, in the southeast, we come to Greenwood, whose name should need no explanation.  Abutting the western border of Thayzhul - called the Threadbare - this nation is an unsurprising blend of the nations that neighbor it.  Trade is heavy, as Greenwood shares borders with Florenza, Ixpanne, Ironhenge, and Thayzhul.  Aspects of magic, while culturally anathema, are nevertheless present due to proximity with Thayzhul and Ixpanne.  With Ironhenge so near to the west, spycraft and suspicion run rampant.  Despite being such a hub among nations, the distinction is unwanted by Greenwood, and she strices for an isolationist policy - with, as you may imagine, mixed results at best."`);
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
