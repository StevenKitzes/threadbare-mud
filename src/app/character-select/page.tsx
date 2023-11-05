'use client';

import React, { useEffect, useState } from 'react';

import '../../app/globals.css';

import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';
import jStr from '@/utils/jStr';
import LoginCTA from '@/components/LoginCTA';
import SideNav from '@/components/SideNav';
import { CharacterList } from './CharacterList';
import CharacterCreate from './CharacterCreate';

const client = new ApolloClient({
  uri: "http://localhost:3000/api/graphql",
  cache: new InMemoryCache(),
});

const GET_CHARACTERS = gql`
  query GetUserCharacters {
    user {
      username
      id
      characters {
        name
        id
        active
      }
    }
  }
`;

const CharacterSelectPage = (): JSX.Element => {
  const { loading, error, data } = useQuery(GET_CHARACTERS, { client });
  const [username, setUsername] = useState<string>('[loading . . .]');

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

  if (loading) {
    return (
      <div className='page-foundation'>
        <div
          className='page-title'
          data-testid='page-title'
        >
          {loading && <div>Loading characters . . .</div>}
        </div>
      </div>
    );
  } else if (error) {
    // @ts-expect-error
    if (error?.networkError?.result?.errors.find(
      (err: any) =>
        err.message.includes("Unable to authenticate GraphQL request.") ||
        err.message.includes("Error validating JWT in GraphQL request.")
    )) {
      return (
        <div className='page-foundation'>
          <div
            className='page-title'
            data-testid='page-title'
          >
            <div>Log in to view your characters.</div>
          </div>
          <LoginCTA />
        </div>
      );
    }

    return (
      <div className='page-foundation'>
        <div className='page-title'>
          <div data-testid='page-title'>Server error loading characters. <pre>{jStr(error, true)}</pre></div>
        </div>
      </div>
    );
  } else {
    return (
      <div className='page-foundation'>
        <div className='m-16 mr-auto text-6xl max-w-[calc(100vw-24rem)] flex flex-col'>
          <div data-testid='page-title'>Choose your active character.</div>
          <CharacterList characters={data.user.characters} />
          <CharacterCreate />
        </div>
        <SideNav username={username} />
      </div>
    );
  }
}

export default CharacterSelectPage;
