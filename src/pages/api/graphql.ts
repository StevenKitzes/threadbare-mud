import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import typeDefs from '@/schema';
import resolvers from '@/resolvers';

import database from '@/sqlite/sqlite';

const server = new ApolloServer({
  resolvers,
  typeDefs
})

export default startServerAndCreateNextHandler(server, {
  context: async () => ({
    database
  })
});

// If CORS becomes needed, here's how you do it:

// import allowCors from '@/utils/allowCors';

// const handler = startServerAndCreateNextHandler(server, {
//   context: async () => ({
//     database
//   })
// });

// export default allowCors(handler);
