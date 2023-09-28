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

function handleGameAction(socket: Socket, token: string, command: string) {
  if (command === 'connect') {
    const character: Character | undefined = readActiveCharacterBySession(token);
    if (!character) return socket.emit('error');
  
    return socket.emit('gameText', {
      gameText: `Welcome to the World of Threadbare, O ${character.name}!`
    });
  }

  // if the action was not recognized
  socket.emit('gameText', {
    gameText: `We know here no magic by the name of [${command}] . . .`,
    options: {
      error: true
    }
  });
}

io.on('connection', (socket) => {
  console.info('A user connected');
  socket.emit('gameText', { gameText: "Connected.  Divining your character information . . ."});

  socket.on('gameAction', (payload: GameAction) => {
    // Validate socket connection
    const secret: string = process.env.JWT_SECRET || '';
    if (secret === '') {
      console.error("Unable to parse JWT secret key for auth.");
      process.exit(6);  // 6 chosen randomly
    }
    try {
      jwt.verify(payload.token, secret);
    } catch (err: any) {
      console.error('Error validating session in socket connection');
      const errText: GameText = {
        gameText: "Unable to verify your login session.",
        options: {
          error: true
        }
      }
      return socket.emit('logout', errText);
    }
    handleGameAction(socket, payload.token, payload.gameAction);
  });

  socket.on('disconnect', () => {
    console.info('User disconnected');
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
