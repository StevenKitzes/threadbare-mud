import { HandlerOptions } from "../server";

export type Item = {
  id: string;
  type: ItemTypes;
  title: string;
  description: string;
  keywords: string[];
  value: number;
  armorValue?: number;
  damageValue?: number;
  hitBonus?: number;
  handleItemCommand?: (handlerOptions: HandlerOptions) => boolean;
};

export const items: Map<string, Item> = new Map<string, Item>();

export enum ItemTypes {
  trinket = "trinket",
  headgear = "headgear",
  armor = "armor",
  gloves = "gloves",
  legwear = "legwear",
  footwear = "footwear",
  weapon = "weapon"
};

export enum ItemIds {
  GOOD_LUCK_CHARM = "1",
  BLACK_HEADBAND = "2",
  LOOSE_BLACK_TUNIC = "3",
  LOOSE_BLACK_PANTS = "4",
  SOFT_BLACK_BOOTS = "5",
  SIMPLE_DAGGER = "6",
}

items.set(ItemIds.GOOD_LUCK_CHARM, {
  id: ItemIds.GOOD_LUCK_CHARM,
  type: ItemTypes.trinket,
  title: "a good luck charm",
  description: "A tiny, hand-made good luck charm that fits in the palm of your hand.  Hopefully this little trinket will always bring luck to whoever carries it.",
  keywords: ['good luck charm', 'charm'],
  value: 1,
});

items.set(ItemIds.BLACK_HEADBAND, {
  id: ItemIds.BLACK_HEADBAND,
  type: ItemTypes.headgear,
  title: "a black headband",
  description: "A simple strip of black cloth, tied around the head.",
  keywords: ['black headband', 'headband'],
  value: 3,
});

items.set(ItemIds.LOOSE_BLACK_TUNIC, {
  id: ItemIds.LOOSE_BLACK_TUNIC,
  type: ItemTypes.armor,
  title: "a loose black tunic",
  description: "A loose-fitting, comfortable, black tunic.  The sleeves are bound tightly to the wrists with strips of cloth wrappings.",
  keywords: ['loose black tunic', 'black tunic', 'tunic'],
  value: 10,
  armorValue: 1
});

items.set(ItemIds.LOOSE_BLACK_PANTS, {
  id: ItemIds.LOOSE_BLACK_PANTS,
  type: ItemTypes.legwear,
  title: "a pair of loose, black pants",
  description: "A loose-fitting, comfortable pair of black pants.  The ankles are bound snugly with strips of cloth wrappings.",
  keywords: ['loose black pants', 'black pants', 'pants'],
  value: 10,
  armorValue: 1
});

items.set(ItemIds.SOFT_BLACK_BOOTS, {
  id: ItemIds.SOFT_BLACK_BOOTS,
  type: ItemTypes.footwear,
  title: "a pair of soft, black boots",
  description: "A pair of black boots made of soft, supple leather.  They are very comfortable and stride atop soft soles that fall quietly.",
  keywords: ['soft black boots', 'black boots', 'soft boots', 'boots'],
  value: 10,
  armorValue: 1
});

items.set(ItemIds.SIMPLE_DAGGER, {
  id: ItemIds.SIMPLE_DAGGER,
  type: ItemTypes.weapon,
  title: "a simple dagger",
  description: "A simple dagger made of plain steel.  It is about the length of a forearm and has a simple leather wrap around the grip.",
  keywords: ['simple dagger', 'dagger'],
  value: 25,
  damageValue: 5
});

export default items;
