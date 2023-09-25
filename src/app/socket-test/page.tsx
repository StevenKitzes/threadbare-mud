'use client';

import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';


export const SocketTest = (): JSX.Element => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const skt = io('ws://localhost:3030');
    setSocket(skt);
    skt.on('connect', () => {
      console.log('Connected to Socket.io');
    });

    // Handle socket events here

    return () => {
      skt.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Socket.io Demo</h1>
      <button
        onClick={() => {
          if (socket !== null) {
            console.log('socket emit');
            socket.emit("data", { message: "client data" });
          }
        }}
      >clicky</button>
    </div>
  );
}

export default SocketTest;
