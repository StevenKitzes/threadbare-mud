import { Character, GameAction, GameText } from '../types';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local'});
dotenv.config({ override: true });

import { readActiveCharacterBySession } from '../../sqlite/sqlite';

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

function handleGameAction(socket: Socket, token: string, command: string) {
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
  socket.emit('request-initialization', { gameText: "Connected.  Divining your character information . . ."});

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
      const connectedCharacter: Character | undefined = readActiveCharacterBySession(payload.token);
      if (connectedCharacter === undefined) throw new Error("Got empty character from database.");

      characters.set(connectedCharacter.id, connectedCharacter);
      socket.join(connectedCharacter.scene_id);

      socket.on('gameAction', (payload: GameAction) => {
        handleGameAction(socket, payload.token, payload.gameAction);
      });    

      socket.on('disconnect', () => {
        characters.delete(connectedCharacter.id);
        console.info(`Character ${connectedCharacter.name} disconnected`);
        console.log("Characters in session:");
        characters.forEach((value: Character) => {
          console.log("We got", value.name);
        })
        });

      socket.emit('game-text', {
        gameText: `Welcome to the World of Threadbare, O ${connectedCharacter.name}!`
      });

      console.log("Characters in session:");
      characters.forEach((value: Character) => {
        console.log("We got", value.name);
      })
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
