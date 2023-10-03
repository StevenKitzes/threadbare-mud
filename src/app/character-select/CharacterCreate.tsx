'use client';

import { ApiResponse } from '@/types';
import postData from '@/utils/postData';
import React, { useState } from 'react';

export const CharacterCreate = (): JSX.Element => {
  const [errors, setErrors] = useState<string[]>([]);

  function create(): void {
    const newCharacterNameInput: HTMLInputElement = document.getElementById('new-character-name') as HTMLInputElement;
    const newCharacterName: string = newCharacterNameInput.value.trim();
    if (newCharacterName.length < 3) {
      setErrors(['Character names must have 3 or more letters.']);
      return;
    }
    if (newCharacterName.length > 20) {
      setErrors(['Character names must have 20 or fewer letters.']);
      return;
    }
    postData('api/create-character', { name: newCharacterName })
      .then((json: ApiResponse) => {
        if (json.status === 200) {
          window.location.reload();
        } else if (json.status === 401) {
          setErrors([ 'Authentication error attempting to select a character.' ]);
        } else if (json.status === 400 && json.message.includes("already in use")) {
          setErrors([ 'That character name is already in use.' ]);
        } else if (json.status === 500) {
          setErrors([ 'The server encountered an error attempting to select a character.' ]);
        } else {
          setErrors([ 'An unknown error occurred.' ]);
        }
      });
  }

  return (
    <div className='flex flex-row'>
      <button
        className='h-10 min-h-[2.5rem] my-4 rounded-lg border-2 text-white bg-violet-400 border-white text-base w-[280px]'
        id='create-new-character-button'
        onClick={create}
        >
        Create New Character
      </button>
      <input
        className="h-10 min-h-[2.5rem] m-4 text-white bg-slate-700 p-2 rounded-lg border-2 border-slate-300 text-base w-[280px]"
        id="new-character-name"
        onKeyUp={(e) => { if (e.key === 'Enter') create() }}
        placeholder="New Character's Name"
      />
      <span className="text-red-500 text-base self-center">
        {errors.join("; ")}
      </span>
    </div>
  );
}

export default CharacterCreate;
