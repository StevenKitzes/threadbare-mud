'use client';

import React, { useEffect } from 'react';

import '../../app/globals.css';

import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';
import jStr from '@/utils/jStr';
import LoginCTA from '@/components/LoginCTA';
import LogoutCTA from '@/components/LogoutCTA';
import { CharacterList } from './CharacterList';

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

  if (loading) {
    return (
      <div className='page-foundation'>
        <div className='page-title'>
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
          <div className='page-title'>
            <div>Log in to view your characters.</div>
          </div>
          <LoginCTA />
        </div>
      );
    }

    return (
      <div className='page-foundation'>
        <div className='page-title'>
          <div>Server error loading characters. <pre>{jStr(error, true)}</pre></div>
        </div>
      </div>
    );
  } else {
    return (
      <div className='page-foundation'>
        <div className='m-16 mr-auto text-6xl max-w-[calc(100vw-24rem)] flex flex-col'>
          Choose your active character.
          <CharacterList characters={data.user.characters} />
        </div>
        <LogoutCTA />
      </div>
    );
  }
}

export default CharacterSelectPage;
