'use client';

import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { v4 } from 'uuid';

import '../../app/globals.css';
import { GameText } from '@/types';
import SideNav from '@/components/SideNav';
import { log } from '@/utils/log';

export const Game = (): JSX.Element => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameTextList, setGameTextList] = useState<GameText[]>([ { gameText: 'Game initializing . . .', options: { error: true } } ]);
  const [command, setCommand] = useState<string>('');
  const [token, setToken] = useState<string|null>(null);
  const [username, setUsername] = useState<string|null>(null);

  useEffect(() => {
    fetch('api/check-session', { method: "POST" })
      .then((res) => {
        if (res.status === 200) {
          res.json()
            .then((json) => {
              setUsername(json.username);
            })
        }
      })
  }, []);

  const gameTextRef = useRef<HTMLDivElement>(null);
  const gameInputRef = useRef<HTMLTextAreaElement>(null);

  function emitGameAction() {
    const cmd: string = command.trim();
    const gt: GameText = {
      gameText: cmd,
      options: {
        echo: true
      }
    }
    if (socket !== null) {
      setGameTextList((gameTextList) => {
        return [
          ...gameTextList,
          gt
        ];
      });
      socket.emit('gameAction', {
        token,
        gameAction: cmd
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
    gameInputRef.current?.focus();
  }, [])

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
    log(process.env.NEXT_PUBLIC_WSS_URL);
    const skt = io(process.env.NEXT_PUBLIC_WSS_URL);
    setSocket(skt);

    // On successful connection . . .
    skt.on('request-initialization', (payload) => {
      log('Connected to Socket.io');
      handleGameText(payload);
      // Confirm auth
      skt.emit('provide-token', {
        token: tokenStr,
      })
    });

    // Handle socket events here
    skt.on('game-text', (payload) => {
      handleGameText(payload);
    });

    skt.on('logout', () => {
      alert('logout socket message received');
    });

    skt.on('error', (payload) => {
      handleGameText(payload);
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
      <div className='page-title flex flex-col'>
        <div data-testid="page-title">Threadbare</div>
        <div
          ref={gameTextRef}
          className='flex-grow bg-slate-900 mt-8 rounded-xl border-2 border-slate-500 p-4 w-full overflow-scroll'
        >
          {gameTextList.map(gt => {
            const classStrings: string[] = [ 'text-lg mt-2' ];
            if (gt.options?.echo) classStrings.push('text-green-600');
            if (gt.options?.error) classStrings.push('text-red-500');
            if (gt.options?.other) classStrings.push('text-slate-400');
            const content: string = Array.isArray(gt.gameText) ? gt.gameText.join(' ') : gt.gameText;
            const formattedContent: string =
              content
                .replace(/\=([^\=]+)\=/g, '<strong class="bad-hint">$1</strong>')
                .replace(/\{([^\}]+)\}/g, '<strong class="emphasize-hint">$1</strong>')
                .replace(/\[([^\]]+)\]/g, '<strong class="command-hint">[$1]</strong>')
                .replace(/\+([^\+]+)\+/g, '<strong class="good-hint">$1</strong>')
                .replace(/\~([^\~]+)\~/g, '<strong class="highlight">$1</strong>');
            return (
              <div
                className={classStrings.join(' ')}
                dangerouslySetInnerHTML={{__html: formattedContent}}
                key={ v4() }
              />
            );
          })}
        </div>
        <div className='text-base mt-4 ml-4'>
          What would you like to do?
        </div>
        <textarea
          className='bg-slate-800 my-4 rounded-xl border-2 border-slate-500 p-4 text-lg w-full h-20'
          data-testid="player-input"
          onChange={(evt) => {
            setCommand(evt.target.value);
          }}
          onKeyUp={(evt) => {
            if (evt.key === 'Enter') {
              emitGameAction();
            }
          }}
          ref={gameInputRef}
          value={command}
        />
      </div>
      <SideNav username={username} />
    </div>
  );
}

export default Game;
