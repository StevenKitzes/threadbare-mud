import { Character, User } from '@/types';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local'});
dotenv.config({ override: true });

import database from '../../sqlite/sqlite.ts';

type GameAction = {
  token: string;
  gameAction: string;
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  // @ts-expect-error
  cors: {
    // origin means, the client info, not the server; meaning, the client is the "origin"ator
    origin: "http://localhost:3000"
  }
});

const port = 3030;

io.on('connection', (socket) => {
  console.info('A user connected');
  socket.emit('data', { gameText: 'You are connected.'});
  
  socket.on('gameAction', (payload: GameAction) => {
    // Validate socket connection
    const secret: string = process.env.JWT_SECRET || '';
    if (secret === '') {
      console.error("Unable to parse JWT secret key for auth.");
      process.exit(6);  // 6 chosen randomly
    }
    try {
      jwt.verify(payload.token, secret);
    } catch (err) {
      return socket.emit('logout');
    }
    const user: User | undefined = database.readUserBySession(payload.token);
    if (!user) return socket.emit('logout');

    // const character: Character | undefined = readActiveCharacterByUserId(user.id);
    // if (!character) return socket.emit('error');

    // switch (payload.gameAction) {
    //   case 'connect':
    //     socket.emit('data', {
    //       gameText: `Welcome to Threadbare, ${user.username}!  You have entered the world as ${character.name}.`
    //     })
    //     break;
    // }
  });

  socket.on('disconnect', () => {
    console.info('User disconnected');
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
