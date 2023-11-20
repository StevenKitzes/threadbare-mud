import { Character, CharacterUpdateOpts, Faction, FactionAnger, GameAction, GameText } from '../types';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local'});
dotenv.config({ override: true });

import { accountHasActiveCharacter, readActiveCharacterBySession, writeCharacterData } from '../../sqlite/sqlite';

import items, { Item } from './items/items';
import { captureFrom } from '../utils/makeMatcher';
import {
  REGEX_BUY_ALIASES,
  REGEX_DRINK_ALIASES,
  REGEX_DROP_ALIASES,
  REGEX_EAT_ALIASES,
  REGEX_EQUIP_ALIASES,
  REGEX_EVAL_ALIASES,
  REGEX_FIGHT_ALIASES,
  REGEX_GET_ALIASES,
  REGEX_GIVE_ALIASES,
  REGEX_GO_ALIASES,
  REGEX_LOOK_ALIASES,
  REGEX_READ_ALIASES,
  REGEX_TALK_ALIASES,
  REGEX_UNEQUIP_ALIASES,
  REGEX_USE_ALIASES
} from '../constants';
import { initializeCharacter } from '../utils/initializeCharacter';
import handleQuestsCommand from './quests/quests';
import handleCharacterCommand, { getInventoryAndWorn } from './character/character';
import { Scene, getItemsForSaleAtScene, scenes } from './scenes/scenes';
import { handleHorseCommand } from './horse/horse';
import { firstUpper } from '../utils/firstUpper';
import { isAmbiguousLookRequest, isAmbiguousPurchaseRequest, isAmbiguousSellBuyerRequest, isAmbiguousSellItemRequest } from '../utils/ambiguousRequestHelpers';
import { error, errorParts, log } from '../utils/log';

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

  // un-anger forgiving factions
  const characterUpdate: CharacterUpdateOpts = {};
  characterUpdate.factionAnger = [
    ...character.factionAnger,
  ];
  const forgiven: Faction[] = [];
  for (let i = characterUpdate.factionAnger.length - 1; i >= 0; i--) {
    const currentFactionAnger: FactionAnger = characterUpdate.factionAnger[i];
    if (Date.now() >= currentFactionAnger.expiry) {
      forgiven.push(currentFactionAnger.faction);
      characterUpdate.factionAnger.splice(i, 1);
    }
  }
  if (character.factionAnger.length !== characterUpdate.factionAnger.length) {
    if (writeCharacterData(handlerOptions, characterUpdate)) {
      socket.emit('game-text', {
        gameText: forgiven.map(f => `It took some time, but ${f} have forgiven you.`)
      });
    }
  }

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
  if (items.get(character.headgear)?.handleItemCommand?.(handlerOptions)) return;
  if (items.get(character.armor)?.handleItemCommand?.(handlerOptions)) return;
  if (items.get(character.gloves)?.handleItemCommand?.(handlerOptions)) return;
  if (items.get(character.legwear)?.handleItemCommand?.(handlerOptions)) return;
  if (items.get(character.footwear)?.handleItemCommand?.(handlerOptions)) return;
  if (items.get(character.weapon)?.handleItemCommand?.(handlerOptions)) return;
  if (items.get(character.offhand)?.handleItemCommand?.(handlerOptions)) return;
  for (let i = 0; i < character.inventory.length; i++) {
    const item: Item | undefined = items.get( character.inventory[i] );
    if (item === undefined) continue;
    if (item.handleItemCommand && item.handleItemCommand(handlerOptions)) return;
  }
  
  // check if there are any scene level input options for this character's scene
  try {
    const scene: Scene | undefined = scenes.get(character.scene_id);
    if (scene === undefined) {
      errorParts(["Could not get character's scene at handleGameAction in server.ts with sceneId:", character.scene_id]);
      return;
    }
    // intercept ambiguous look requests
    try {
      if (isAmbiguousLookRequest(handlerOptions, [
        ...getInventoryAndWorn(character),
        ...scene.publicInventory.map(i => items.get(i)),
        ...getItemsForSaleAtScene(character.id, scene.id)
      ])) return;
    } catch(err) {
      errorParts(['encountered error checking for ambiguous look requests:', err.toString()]);
      errorParts(['character state:', command]);
      errorParts(['character state:', character]);
      return;
    }
    // intercept ambiguous purchase requests
    try {
      if (isAmbiguousPurchaseRequest(handlerOptions, scene)) return;
    } catch(err) {
      errorParts(['encountered error checking for ambiguous purchase request with command:', command]);
      errorParts(['character state:', character]);
      errorParts(['error:', err.toString()]);
      return;
    }
    // intercept ambiguous sell requests
    try {
      if (isAmbiguousSellItemRequest(handlerOptions)) return;
    } catch(err) {
      errorParts(['encountered error checking for ambiguous sale request with command:', command]);
      errorParts(['character state:', character]);
      errorParts(['error:', err.toString()]);
      return;
    }
    try {
      if (isAmbiguousSellBuyerRequest(handlerOptions, scene)) return;
    } catch(err) {
      errorParts(['encountered error checking for ambiguous buyer request with command:', command]);
      errorParts(['character state:', character]);
      errorParts(['error:', err.toString()]);
      return;
    }
    if (scene.handleSceneCommand(handlerOptions)) return;
  } catch(err) {
    errorParts(['failed loading scene id', character.scene_id, ":", err.toString()]);
    return;
  }

  // check if there are horse-related actions for this command
  if (handleHorseCommand(handlerOptions)) return;
  
  // if the action was not recognized
  let output: string;
  let targetName: string | null;
  if (targetName = captureFrom(command, REGEX_BUY_ALIASES)) output = `There is no {${targetName}} available for purchase.`;
  else if (targetName = captureFrom(command, REGEX_DRINK_ALIASES)) output = `You don't have any {${targetName}} to drink.`;
  else if (targetName = captureFrom(command, REGEX_DROP_ALIASES)) output = `You aren't carrying any {${targetName}}.`;
  else if (targetName = captureFrom(command, REGEX_EAT_ALIASES)) output = `You don't have any {${targetName}} to eat.`;
  else if (targetName = captureFrom(command, REGEX_EQUIP_ALIASES)) output = `You don't have any {${targetName}} to equip.`;
  else if (targetName = captureFrom(command, REGEX_EVAL_ALIASES)) output = `You find nothing interesting about {${targetName}} beyond the surface (or there is no ${targetName} here).`;
  else if (targetName = captureFrom(command, REGEX_FIGHT_ALIASES)) output = `There isn't any {${targetName}} worth fighting here.`;
  else if (targetName = captureFrom(command, REGEX_GET_ALIASES)) output = `You can't get {${targetName}} here.`;
  else if (targetName = captureFrom(command, REGEX_GIVE_ALIASES)) output = `You can't give {${targetName}} right now.`;
  else if (targetName = captureFrom(command, REGEX_GO_ALIASES)) output = `{${firstUpper(targetName)}} isn't somewhere you can go right now.`;
  else if (targetName = captureFrom(command, REGEX_LOOK_ALIASES)) output = `You find nothing interesting about {${targetName}} beyond the surface (or there is no ${targetName} here).`;
  else if (targetName = captureFrom(command, REGEX_READ_ALIASES)) output = `You are not carrying any {${targetName}} to read.`;
  else if (targetName = captureFrom(command, REGEX_TALK_ALIASES)) output = `You do not see {${targetName}} here to talk to.`;
  else if (targetName = captureFrom(command, REGEX_UNEQUIP_ALIASES)) output = `You don't have any {${targetName}} equipped.`;
  else if (targetName = captureFrom(command, REGEX_USE_ALIASES)) output = `You are not carrying any {${targetName}} you can use.`;

  else if (command.match(REGEX_BUY_ALIASES)) output = 'What do you want to [buy]?';
  else if (command.match(REGEX_DRINK_ALIASES)) output = 'What do you want to [drink]?';
  else if (command.match(REGEX_DROP_ALIASES)) output = 'What do you want to [drop]?';
  else if (command.match(REGEX_EAT_ALIASES)) output = 'What do you want to [eat]?';
  else if (command.match(REGEX_EQUIP_ALIASES)) output = 'What do you want to [equip]?';
  else if (command.match(REGEX_EVAL_ALIASES)) output = 'What do you want to [inspect]?';
  else if (command.match(REGEX_FIGHT_ALIASES)) output = 'Who do you want to [fight]?';
  else if (command.match(REGEX_GET_ALIASES)) output = 'What do you want to [get]?';
  else if (command.match(REGEX_GIVE_ALIASES)) output = 'What do you want to [give] and to whom?';
  else if (command.match(REGEX_GO_ALIASES)) output = 'Where do you want to [go]?';
  else if (command.match(REGEX_READ_ALIASES)) output = 'What do you want to [read]?';
  else if (command.match(REGEX_TALK_ALIASES)) output = 'Who do you want to [talk] to?';
  else if (command.match(REGEX_UNEQUIP_ALIASES)) output = 'What do you want to [remove]?';
  else if (command.match(REGEX_USE_ALIASES)) output = 'What do you want to [use]?';

  else output = `You can't {${command}} here.`;

  socket.emit('game-text', {
    gameText: output,
    options: {
      error: true
    }
  });
}

io.on('connection', (socket) => {
  log('A user connected');
  socket.emit('request-initialization', {
    gameText: "Connected.  Divining your character information . . .",
    options: {
      echo: true
    }
  });

  socket.on('provide-token', (payload: { token: string }) => {
    // Validate socket connection
    const secret: string = process.env.JWT_SECRET || '';
    if (secret === '') {
      error("Unable to parse JWT secret key for auth.");
      process.exit(6);  // 6 chosen randomly
    }
    try {
      jwt.verify(payload.token, secret);
    } catch (err: any) {
      error('Error validating session in socket connection during provide-token event');
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

      initializeCharacter(connectedCharacter);

      characters.set(connectedCharacter.id, connectedCharacter);
      socket.join(connectedCharacter.scene_id);

      socket.on('gameAction', (payload: GameAction) => {
        handleGameAction({
          io,
          socket,
          character: connectedCharacter,
          characterList: characters,
          command: payload.gameAction.toLowerCase().replace(/[,:’'-]/g, '')
        });
      });    

      socket.on('disconnect', () => {
        socket.to(connectedCharacter.scene_id).emit('game-text', {
          gameText: `${connectedCharacter.name} vanishes into the Lifelight . . .`,
          options: { other: true }
        })
        characters.delete(connectedCharacter.id);
        log(`Character ${connectedCharacter.name} disconnected`);
        // log("Characters in session:");
        // characters.forEach((value: Character) => {
        //   log("We got", value.name);
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

      // log("Characters in session:");
      // characters.forEach((value: Character) => {
      //   log("We got", value.name);
      // })
    } catch (err: any) {
      errorParts(["Error reading character from session", err.toString()]);
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
  log(`Server is running on port ${port}`);
});
