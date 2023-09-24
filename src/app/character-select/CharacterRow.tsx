import postData from '@/utils/postData';
import React from 'react';

import { ApiResponse } from '@/types';

type CharacterRowProps = {
  active: number;
  bottom: boolean;
  id: string;
  name: string;
  top: boolean;
}

function selectCharacter(id: string) {
  postData('api/select-character', { id })
    .then((json: ApiResponse) => {
      if (json.status === 200) {
        window.location.reload();
      } else if (json.status === 401) {
        alert('Authentication error attempting to select a character.');
      } else if (json.status === 500) {
        alert('The server encountered an error attempting to select a character.');
      } else {
        alert('An unknown error occurred.');
      }
    });
}

export const CharacterRow = ({ active, bottom, id, name, top }: CharacterRowProps): JSX.Element => {
  return (
    <div className="flex flex-row">
      {/* Describe whether it's active */}
      <div className={`${top ? "rounded-tl-lg " : ""}${bottom ? "rounded-bl-lg " : ""}text-black bg-violet-300 p-3 w-24 flex align-middle justify-center border border-black`}>
        {active === 1 ? "Active" : ""}
      </div>
      {/* Character's name */}
      <div className="text-black bg-violet-300 p-3 w-96 flex align-middle justify-center border border-black">
        {name}
      </div>
      <div
        className={`${top ? "rounded-tr-lg " : ""}${bottom ? "rounded-br-lg " : ""}text-black bg-violet-300 p-3 w-24 flex align-middle justify-center underline border border-black cursor-pointer`}
        onClick={() => selectCharacter(id)}
      >
        Activate
      </div>
    </div>
  );
}
