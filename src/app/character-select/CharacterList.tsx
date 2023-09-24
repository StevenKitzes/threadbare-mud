import { Character } from '@/types';
import React, { ReactNode } from 'react';
import { CharacterRow } from './CharacterRow';

const Container = ({ children }: { children: ReactNode[] | ReactNode }): JSX.Element => {
  return (
    <div className="mt-10 flex flex-col text-base">
      {children}
    </div>
  );
}

type CharacterListProps = {
  characters: Character[];
}

export const CharacterList = ({ characters }: CharacterListProps): JSX.Element => {
  if (characters.length === 0) {
    return (
      <Container>
        You don't have any characters to pick from.
      </Container>
    );
  }

  return (
    <Container>
      {characters.map((character: Character, idx: number) => {
        const top: boolean = idx === 0;
        const bottom: boolean = idx === characters.length - 1;

        return (
          <CharacterRow
            active={character.active}
            bottom={bottom}
            id={character.id}
            key={character.id}
            name={character.name}
            top={top}
          />
        )
      })}
    </Container>
  );
}