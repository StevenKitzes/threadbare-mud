import { NextRequest } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import typeDefs from '@/graphql/schema';
import resolvers from '@/graphql/resolvers';

import database from '../../../../sqlite/sqlite';

const server = new ApolloServer<object>({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async () => ({
    database
  })
});

export { handler as GET, handler as POST };

// If CORS becomes needed, here's how you do it:

// import allowCors from '@/utils/allowCors';

// const handler = startServerAndCreateNextHandler(server, {
//   context: async () => ({
//     database
//   })
// });

// export default allowCors(handler);
