import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { it, test, expect, assert } from "vitest";

const server = new ApolloServer({
  typeDefs,
  resolvers
});

it("returns ticket with specification", async () => {
  const response = await server.executeOperation({
    query: "query Tickets() { title }"
  });

  console.log(response);
});
