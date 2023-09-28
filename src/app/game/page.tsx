'use client';

import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { v4 } from 'uuid';

import '../../app/globals.css';
import { SideNav } from './SideNav';
import { GameText } from '@/types';

export const Game = (): JSX.Element => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameTextList, setGameTextList] = useState<GameText[]>([ { gameText: 'Game initializing . . .', options: { error: true } } ]);
  const [command, setCommand] = useState<string>('');
  const [token, setToken] = useState<string|null>(null);

  const gameTextRef = useRef<HTMLDivElement>(null);

  function emitGameAction() {
    if (socket !== null) {
      socket.emit('gameAction', {
        token,
        gameAction: command.trim()
      });
      setCommand('');
    }
  }

  // GameText.gameText can be a plain string or an array of strings, and we resolve that here.
  function handleGameText(payload: GameText) {
    const toAdd: GameText[] = [];
    if (Array.isArray(payload.gameText)) {
      payload.gameText.forEach(gt => {
        toAdd.push({
          gameText: gt,
          options: payload.options
        });
      });
    } else {
      toAdd.push(payload);
    }
    setGameTextList((gameTextList) => {
      return [
          ...gameTextList,
          ...toAdd
      ];
    });
  }
  
  useEffect(() => {
    gameTextRef.current?.scrollTo(0, gameTextRef.current.scrollHeight);
  }, [ gameTextList ])

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
    const tokenStr = tokenCookie.split('=')[1];
    setToken(tokenStr);

    // Create socket connection
    const skt = io('ws://localhost:3030');
    setSocket(skt);
    // On successful connection . . .
    skt.on('connect', () => {
      console.info('Connected to Socket.io');
      // Confirm auth
      skt.emit('gameAction', {
        token: tokenStr,
        gameAction: 'connect'
      })
    });

    // Handle socket events here
    skt.on('gameText', (payload) => {
      handleGameText(payload);
    });

    skt.on('logout', () => {
      alert('logout socket message received');
    });

    skt.on('error', () => {
      alert('error socket message received');
    });

    skt.on('disconnect', () => {
      setSocket(null);
    });

    return () => {
      skt.disconnect();
      setSocket(null);
    };
  }, []);
  return (
    <div className='page-foundation'>
      <div className='page-title'>
        Threadbare
        <div ref={gameTextRef} className='bg-slate-900 mt-8 rounded-xl border-2 border-slate-500 p-4 w-full max-h-96 overflow-scroll'>
          {gameTextList.map(gt => {
            const classString: string = gt.options?.error ? 'text-lg text-red-500' : 'text-lg';
            return (<div className={classString} key={ v4() }>{gt.gameText}</div>);
          })}
        </div>
        <div className='text-base mt-4 ml-4'>
          What would you like to do?
        </div>
        <textarea
          className='bg-slate-800 my-4 rounded-xl border-2 border-slate-500 p-4 text-lg w-full h-20'
          onChange={(evt) => {
            setCommand(evt.target.value);
          }}
          onKeyUp={(evt) => {
            if (evt.key === 'Enter') {
              emitGameAction();
            }
          }}
          value={command}
        />
      </div>
      <SideNav />
    </div>
  );
}

export default Game;
