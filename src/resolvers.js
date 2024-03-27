import { models } from "./db";

export const resolvers = {
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
