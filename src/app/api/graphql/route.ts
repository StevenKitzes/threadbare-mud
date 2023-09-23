import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import jwt from 'jsonwebtoken';

import typeDefs from '@/graphql/schema';
import resolvers from '@/graphql/resolvers';

import database, { readUserByName, readUserBySession } from '../../../../sqlite/sqlite';
import { User } from '@/types';

const server = new ApolloServer<object>({
  typeDefs,
  resolvers,
});

function throwErr(msg: string) {
  console.error(msg);
  return new Error(msg);
}

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async () => {
    const clientToken = cookies().get('token');

    if (clientToken) {
      try {
        // verify it is not expired
        jwt.verify(clientToken.value, process.env.JWT_SECRET);
        // verify it belongs to an actual user
        const user: User | undefined = readUserBySession(clientToken.value);
        if (user === undefined) {
          throw throwErr("Client tried to make GQL query with valid JWT but no matching user.");
        }
        // actual context definition
        return {
          user,
          database
        };
      } catch (err: any) {
        // if it is expired
        if (err.toString().includes("TokenExpiredError")) {
          throw throwErr("Token found but expired in GraphQL query request.");
        }
        throw throwErr("Problem with JWT verification in GraphQL query request.");
      }
    } else { // no token at all
      throw throwErr("No token cookie found in GraphQL query request.");
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
