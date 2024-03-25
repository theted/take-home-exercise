import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

const PORT = 4001;

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.start().then(() => {
  const app = express();
  server.applyMiddleware({ app });

  app.listen({ port: PORT }, () => {
    console.log(
      `Server ready at: http://localhost:${PORT}${server.graphqlPath}`
    );
  });
});
