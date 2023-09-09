'use client'

import React from 'react';
import { ApolloClient, InMemoryCache, useQuery, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: "http://localhost:3000/api/graphql",
  cache: new InMemoryCache(),
});

const GET_ITEM = gql`
  query GetItem($itemId: String, $sceneId: String) {
    item(itemId: $itemId) {
      id
      name
    }
    scene(sceneId: $sceneId) {
      id
      name
    }
  }
`;

export default () => {
  const { loading, error, data } = useQuery(GET_ITEM, {
    client,
    variables: {
      itemId: 'testItemId',
      sceneId: 'testSceneId'
    }
  });

  return (
    <>
      {loading && <div>Loading . . .</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <>
        <div>Hello it is a div</div>
        <button
          onClick={() => alert(`got item data: ${JSON.stringify(data, null, 2)}`)}
          >
          here is a button probably
        </button>
      </>}
    </>
  );
}
