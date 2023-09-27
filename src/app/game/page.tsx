'use client';

import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { v4 } from 'uuid';

import '../../app/globals.css';
import { SideNav } from './SideNav';

export const Game = (): JSX.Element => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameTextList, setGameTextList] = useState<string[]>(['Game initializing . . .']);

  useEffect(() => {
    // Make sure we have an auth token cookie
    if (!document.cookie) {
      window.location.href = '/login';
      return;
    }
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.split('=')[0] === 'token');
    if (!tokenCookie) {
      window.location.href = '/login';
      return;
    }
    const token = tokenCookie.split('=')[1];

    // Create socket connection
    const skt = io('ws://localhost:3030');
    setSocket(skt);
    // On successful connection . . .
    skt.on('connect', () => {
      console.log('Connected to Socket.io');
      setGameTextList([...gameTextList, "Connected to Threadbare.  Divining your character information . . ."]);
      // Set up auth
      skt.emit('gameAction', {
        token,
        action: 'connect'
      })
    });

    // Handle socket events here
    skt.on('data', (payload) => {
      if (typeof payload?.gameText !== 'string') {
         return;
      }
      setGameTextList([...gameTextList, payload.gameText]);
    })

    return () => {
      skt.disconnect();
    };
  }, []);
  return (
    <div className='page-foundation'>
      <div className='page-title'>
        The Game Itself
        <div className='bg-slate-900 mt-8 rounded-xl border-2 border-slate-500 p-4'>
          {gameTextList.map((text) => (
            <div className='text-lg' key={v4()}>{text}</div>
          ))}
        </div>
      </div>
      <SideNav />
    </div>
  );
  // return (
  //   <div>
  //     <h1>Socket.io Demo</h1>
  //     <button
  //       onClick={() => {
  //         if (socket !== null) {
  //           console.log('socket emit');
  //           socket.emit("data", { message: "client data" });
  //         }
  //       }}
  //     >clicky</button>
  //   </div>
  // );
}

export default Game;
