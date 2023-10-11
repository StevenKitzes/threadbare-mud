import { Character, GameAction, GameText } from '../types';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local'});
dotenv.config({ override: true });

import { accountHasActiveCharacter, readActiveCharacterBySession } from '../../sqlite/sqlite';
import { handleCharacterCommand } from './character/character';

import { Scene, scenes } from './scenes/scenes';
import handleQuestsCommand from './quests/quests';
import items, { Item } from './items/items';
import characterCanMove from '../utils/characterCanMove';
import getGameTextObject from '../utils/getGameTextObject';

export type HandlerOptions = {
  io: Server;
  socket: Socket;
  character: Character;
  characterList: Map<string, Character>;
  command: string;
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  // @ts-ignore
  cors: {
    // origin means, the client info, not the server; meaning, the client is the "origin"ator
    origin: "http://localhost:3000"
  }
});

const port = 3030;

const characters: Map<string, Character> = new Map<string, Character>();

function handleGameAction(handlerOptions: HandlerOptions): void {
  const { character, command, socket } = handlerOptions;
  // check if the player just needs a little help
  if (command === 'help') {
    socket.emit('game-text', {
      gameText: [
        "You can [look] at or [inspect] things you find in the world.  Try [look self] to see what happens!  Or just [look] to see what is around you.",
        "You can [peek] to look inside closed items or try to catch a glimpse through closed doors.  Try [peek door] when you see a [door] and maybe you can see what lies beyond . . .",
        "If you want to leave a scene, you can [go] through an exit.  Try [go heavy door] to see where you will end up!",
        "If you want to pick up an item you find in the world, [get] it!  Try [get sword] if you see one!",
        "If you want to drop an item in your inventory, [drop] it!  Try [drop helmet] if you have one you don't want anymore!",
        "You can [use], [wear], or [equip] appropriate items in your inventory.  Try [use wand], [wear armor], or [equip magic staff]!",
        "You can [talk], [fight], or [trade] with people and creatures in the world.  Get creative!",
        "You can also check the status of your [quests].",
        "",
        "Keep a look out for scene, item, and other desciptions with brackets for hints about what kinds of things you can [do] in the world!"
      ]
    });
    return;
  }

  // handle the user checking their quest status
  if (handleQuestsCommand(handlerOptions)) return;

  // check if there are any character level input options for this character
  if (handleCharacterCommand(handlerOptions)) return;

  // check if any of the character's carried items can handle the command
  for (let i = 0; i < character.inventory.length; i++) {
    const item: Item | undefined = items.get( character.inventory[i] );
    if (item === undefined) continue;
    if (item.handleItemCommand && item.handleItemCommand(handlerOptions)) return;
  }

  // before letting the character try to move, check encumbrance
  if (command.match(/^go /) && !characterCanMove(character)) {
    // others
    socket.to(character.scene_id).emit('game-text', getGameTextObject(`${character.name} is carrying so much that they are unable to move, however hard they may try.`));
    // self
    socket.emit('game-text', getGameTextObject( "You are carrying so much that you cannot take another step." ));

    return;
  }
  
  // check if there are any scene level input options for this character's scene
  try {
    const scene: Scene | undefined = scenes.get(character.scene_id);
    if (scene === undefined) {
      console.error("Could not get character's scene at handleGameAction in server.ts with sceneId:", character.scene_id);
      return;
    }
    if (scene.handleSceneCommand(handlerOptions)) return;
  } catch(err) {
    console.error('failed loading scene id', character.scene_id, ":", err.toString());
    console.error('scene ids', scenes.keys())
  }
  
  
  // if the action was not recognized
  socket.emit('game-text', {
    gameText: `We know here no magic by the name of [${command}] . . .`,
    options: {
      error: true
    }
  });
}

io.on('connection', (socket) => {
  console.info('A user connected');
  socket.emit('request-initialization', {
    gameText: "Connected.  Divining your character information . . .",
    options: {
      echo: true
    }
  });

  socket.on('provide-token', (payload: { token: string }) => {
    console.log('Got provide-token event.');
    // Validate socket connection
    const secret: string = process.env.JWT_SECRET || '';
    if (secret === '') {
      console.error("Unable to parse JWT secret key for auth.");
      process.exit(6);  // 6 chosen randomly
    }
    try {
      jwt.verify(payload.token, secret);
      console.log('Verified token in provide-token event.');
    } catch (err: any) {
      console.error('Error validating session in socket connection during provide-token event');
      const errText: GameText = {
        gameText: "Unable to verify your login session.",
        options: {
          error: true
        }
      }
      return socket.emit('logout', errText);
    }

    // valid token confirmed
    try {
      if (!accountHasActiveCharacter(payload.token)) {
        return socket.emit('game-text', {
          gameText: "You don't have a character activated yet.  Make sure you have created and activated a character on the Select Character screen.",
          opts: { error: true }
        });
      }

      const connectedCharacter: Character | undefined = readActiveCharacterBySession(payload.token);
      if (connectedCharacter === undefined) throw new Error("Got empty character from database.");

      characters.set(connectedCharacter.id, connectedCharacter);
      socket.join(connectedCharacter.scene_id);

      socket.on('gameAction', (payload: GameAction) => {
        handleGameAction({
          io,
          socket,
          character: connectedCharacter,
          characterList: characters,
          command: payload.gameAction.toLowerCase()
        });
      });    

      socket.on('disconnect', () => {
        socket.to(connectedCharacter.scene_id).emit('game-text', {
          gameText: `${connectedCharacter.name} vanishes into the Lifelight . . .`,
          options: { other: true }
        })
        characters.delete(connectedCharacter.id);
        console.info(`Character ${connectedCharacter.name} disconnected`);
        // console.log("Characters in session:");
        // characters.forEach((value: Character) => {
        //   console.log("We got", value.name);
        // });
      });

      socket.emit('game-text', {
        gameText: [
          `Welcome to the World of Threadbare, O ${connectedCharacter.name}!`,
          `You may type "help" for some basic assistance.`,
          `- - - - - - - - - -`
        ]
      });
      socket.to(connectedCharacter.scene_id).emit('game-text', {
        gameText: `${connectedCharacter.name} materializes from the Lifelight . . .`,
        options: { other: true }
      })

      handleGameAction({
        io,
        socket,
        character: connectedCharacter,
        characterList: characters,
        command: 'enter'
      });

      // console.log("Characters in session:");
      // characters.forEach((value: Character) => {
      //   console.log("We got", value.name);
      // })
    } catch (err: any) {
      console.error("Error reading character from session", err.toString());
      const errText: GameText = {
        gameText: "Problem encountered reading character from database.",
        options: {
          error: true
        }
      }
      return socket.emit('error', errText);
    }
  })
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
