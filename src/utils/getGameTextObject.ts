import { GameText } from "@/types";

export type OptsType = {
  echo?: boolean;
  error?: boolean;
  other?: boolean;
}

export const getGameTextObject = (text: string | string[], opts?: OptsType): GameText => {
  return {
    gameText: text,
    options: opts
  };
}

export default getGameTextObject;
