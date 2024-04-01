import { ApolloServer, gql } from "apollo-server-express";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { it, expect } from "vitest";

const server = new ApolloServer({
  typeDefs,
  resolvers
});

it("returns tickets without parents", async () => {
  const response = await server.executeOperation({
    query: gql`
      query {
        tickets {
          title
        }
      }
    `
  });

  expect(response.data.tickets[0].title).toBe("Foo");
});

it("returns a single ticket", async () => {
  const response = await server.executeOperation({
    query: gql`
      query ($id: ID!) {
        ticket(id: $id) {
          title
        }
      }
    `,
    variables: { id: 1 }
  });

  expect(response.data.ticket.title).toBe("Foo");
});

it("creates a ticket", async () => {
  const response = await server.executeOperation({
    query: gql`
      mutation {
        createTicket(title: "Bar", isCompleted: false) {
          title
        }
      }
    `
  });

  expect(response.data.createTicket.title).toBe("Bar");
});

it("updates ticket", async () => {
  const response = await server.executeOperation({
    query: gql`
      mutation {
        updateTicket(id: 3, title: "Baz") {
          title
        }
      }
    `
  });

  expect(response.data.updateTicket.title).toBe("Baz");
});

it("sets parent of ticket", async () => {
  const response = await server.executeOperation({
    query: gql`
      mutation {
        setParentOfTicket(parentId: 1, childId: 2) {
          title
        }
      }
    `
  });

  expect(response.data.setParentOfTicket.title).toBe("Bar");
});

it("adds children to ticket", async () => {
  const response = await server.executeOperation({
    query: gql`
      mutation {
        addChildrenToTicket(parentId: 1, childrenIds: [2, 3]) {
          title
          children {
            id
            title
          }
        }
      }
    `
  });

  expect(response.data.addChildrenToTicket.children[0].id).toBe("2");
});

it("removes parent from ticket", async () => {
  const response = await server.executeOperation({
    query: gql`
      mutation {
        removeParentFromTicket(id: 1) {
          title
          children {
            id
            title
          }
        }
      }
    `
  });

  expect(response.data.removeParentFromTicket.title).toBe("Foo");
});

it("toggles ticket", async () => {
  const response = await server.executeOperation({
    query: gql`
      mutation {
        toggleTicket(id: 1, isCompleted: true) {
          isCompleted
        }
      }
    `
  });

  expect(response.data.toggleTicket.isCompleted).toBe(true);
});
