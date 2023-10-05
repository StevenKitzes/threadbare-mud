import { HandlerOptions } from "../server";

export type Item = {
  id: string;
  type: ItemTypes;
  title: string;
  value: number;
  handleSceneCommand?: (handlerOptions: HandlerOptions) => boolean;
};

export const items: Map<string, Item> = new Map<string, Item>();

export enum ItemTypes {
  trinket = "trinket",
};

export enum ItemIds {
  GOOD_LUCK_CHARM = "0",
}

items.set(ItemIds.GOOD_LUCK_CHARM, {
  id: ItemIds.GOOD_LUCK_CHARM,
  type: ItemTypes.trinket,
  title: "good luck charm",
  value: 1,
});

export default items;
