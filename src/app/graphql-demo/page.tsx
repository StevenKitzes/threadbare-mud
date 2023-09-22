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
      itemId: '8157dc95-b4ef-4f81-bdea-c4099685e123',
      sceneId: '3a1b2410-c93b-4e5c-9c34-918ffaa81c4d'
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
