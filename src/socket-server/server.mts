import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  // @ts-expect-error
  cors: {
    origin: "*"
  }
});

const port = 3030;

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle socket events here
  socket.on('data', (payload) => {
    console.log(payload);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
