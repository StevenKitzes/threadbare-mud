import { HandlerOptions } from '../server';

export function handleCharacterCommand(handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  if (command === 'look self') {
    socket.to(character.scene_id).emit('game-text', {
      gameText: `${character.name} is admiring themselves.`,
      options: { other: true }
    });
    socket.emit('game-text', {
      gameText: `You observe yourself, a being named ${character.name}.`
    })
    return true;
  }
  return false;
}

export default handleCharacterCommand;
