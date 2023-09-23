'use client'

import React from 'react';
import { ApolloClient, InMemoryCache, useQuery, gql } from '@apollo/client';
import jStr from '@/utils/jStr';

const client = new ApolloClient({
  uri: "http://localhost:3000/api/graphql",
  cache: new InMemoryCache(),
});

const GET_ITEM = gql`
  query GetItem($itemId: String!, $sceneId: String!) {
    item(itemId: $itemId) {
      id
      name
      description
    }
    scene(sceneId: $sceneId) {
      id
      name
      inventory {
        name
        description
      }
      exits {
        description
      }
    }
  }
`;

export default () => {
  const { loading, error, data } = useQuery(GET_ITEM, {
    client,
    variables: {
      itemId: 'item2TestId',
      sceneId: 'scene1TestId'
    }
  });

  return (
    <>
      {loading && <div>Loading . . .</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <>
        <pre>{jStr(data, true)}</pre>
      </>}
    </>
  );
}
