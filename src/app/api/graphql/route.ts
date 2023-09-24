import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import jwt from 'jsonwebtoken';

import typeDefs from '@/graphql/schema';
import resolvers from '@/graphql/resolvers';
import { User } from '@/types';
import database, { readUserBySession } from '../../../../sqlite/sqlite';

const server = new ApolloServer<object>({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async () => {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie) throw new Error("Unable to authenticate GraphQL request.");

    let user: User | undefined;

    try {
      // verify it is not expired
      jwt.verify(tokenCookie?.value, process.env.JWT_SECRET);
      // verify it belongs to an actual user
      user = readUserBySession(tokenCookie.value);
      if (user === undefined) {
        throw new Error("Got valid JWT but no matching user.");
      }
      return {
        user,
        database
      }
    } catch (err) {
      throw new Error("Error validating JWT in GraphQL request.");
    }
  }
});

export { handler as GET, handler as POST };

// If CORS becomes needed, here's how you do it:

// import allowCors from '@/graphql/allowCors';

// const handler = startServerAndCreateNextHandler(server, {
//   context: async () => ({
//     database
//   })
// });

// export default allowCors(handler);
