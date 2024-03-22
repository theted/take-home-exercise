import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { models } from "./db";

const PORT = 4001;

const typeDefs = gql`
  type Ticket {
    id: ID!
    title: String!
    isCompleted: Boolean!
    children: [Ticket]!
  }

  type Query {
    # return a list of all root level (parentless) tickets.
    tickets: [Ticket]!

    # return the ticket with the given id
    ticket(id: ID!): Ticket!
  }

  type Mutation {
    # create a ticket with the given params
    createTicket(title: String!, isCompleted: Boolean): Ticket!

    # update the title of the ticket with the given id
    updateTicket(id: ID!, title: String!): Ticket!

    # update ticket.isCompleted as given
    toggleTicket(id: ID!, isCompleted: Boolean!): Ticket!

    # delete this ticket
    removeTicket(id: ID!): Boolean!

    # every children in childrenIds gets their parent set as parentId
    addChildrenToTicket(parentId: ID!, childrenIds: [ID!]!): Ticket!

    # the ticket with id: childId gets the ticket with id: parentId as its new parent
    setParentOfTicket(parentId: ID!, childId: ID!): Ticket!

    # the ticket with the given id becomes a root level ticket
    removeParentFromTicket(id: ID!): Ticket!
  }
`;

const resolvers = {
  Query: {
    tickets: async () => {
      return models.Ticket.findAll({
        where: {
          parentId: null
        }
      });
    },
    ticket: async (_root, { id }) => {
      return models.Ticket.findByPk(id);
    }
  },
  Ticket: {
    children: async (parent) => {
      return models.Ticket.findAll({
        where: {
          parentId: parent.id
        }
      });
    }
  },
  Mutation: {
    createTicket: async (_root, { title, isCompleted }) => {
      return models.Ticket.create({ title, isCompleted });
    },

    updateTicket: async (_root, { id, title }) => {
      const ticket = await models.Ticket.findByPk(id);
      ticket.title = title;
      await ticket.save();
      return ticket;
    },

    toggleTicket: async (_root, { id, isCompleted }) => {
      const ticket = await models.Ticket.findByPk(id);
      ticket.isCompleted = isCompleted;
      await ticket.save();
      return ticket;
    },

    removeTicket: async (_root, { id }) => {
      const ticket = await models.Ticket.findByPk(id);
      await ticket.destroy();
      return true;
    },

    addChildrenToTicket: async (_root, { parentId, childrenIds }) => {
      const parent = await models.Ticket.findByPk(parentId);
      await models.Ticket.update(
        { parentId: parent.id },
        {
          where: {
            id: childrenIds
          }
        }
      );

      // TODO: query the parent ticket to get updated ticket, including children
      return parent;
    },

    setParentOfTicket: async (_root, { parentId, childId }) => {
      const child = await models.Ticket.findByPk(childId);
      child.parentId = parentId;
      await child.save();
      return child;
    },

    removeParentFromTicket: async (_root, { id }) => {
      const ticket = await models.Ticket.findByPk(id);
      ticket.parentId = null;
      await ticket.save();
      return ticket;
    }
  }
};

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
