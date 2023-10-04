import { Socket } from '../socket-server/node_modules/socket.io';

import { OptsType } from './getGameTextObject';
import { getGameTextObject } from './getGameTextObject';

type EmitterHelpers = {
  emitOthers: (text: string | string[], opts?: OptsType) => void;
  emitSelf: (text: string | string[], opts?: OptsType) => void;
};

export function getEmitters(socket: Socket, scene: string): EmitterHelpers {
  return {
    emitOthers: function (text: string | string[], opts: OptsType = { other: true }) {
      socket.to(scene).emit('game-text', getGameTextObject( text, opts ));
    },
    emitSelf: function (text: string | string[], opts?: OptsType) {
      socket.emit('game-text', getGameTextObject( text, opts ));
    }
  };
}

export default getEmitters;
