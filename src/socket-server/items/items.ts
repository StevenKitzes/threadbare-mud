import { HandlerOptions } from "../server";

export type Item = {
  id: string;
  type: ItemTypes;
  title: string;
  description: string;
  keywords: string[];
  value: number;
  handleSceneCommand?: (handlerOptions: HandlerOptions) => boolean;
};

export const items: Map<string, Item> = new Map<string, Item>();

export enum ItemTypes {
  trinket = "trinket",
};

export enum ItemIds {
  GOOD_LUCK_CHARM = "1",
}

items.set(ItemIds.GOOD_LUCK_CHARM, {
  id: ItemIds.GOOD_LUCK_CHARM,
  type: ItemTypes.trinket,
  title: "a [good luck charm]",
  description: "A tiny, hand-made good luck charm that fits in the palm of your hand.  Hopefully this little trinket will always bring luck to whoever carries it.",
  keywords: ['good luck charm', 'charm'],
  value: 1,
});

export default items;
