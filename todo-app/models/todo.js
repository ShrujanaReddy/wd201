'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // Define associations here if needed.
    }

    static addTodo({ title, dueDate }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
      });
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    static getTodos() {
      return this.findAll();
    }

    static async dueLater() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toISOString().split('T')[0],
          },
          completed: false,
        },
        order: [['id', 'ASC']],
      });
    }

    static async overdue() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().split('T')[0],
          },
          completed: false,
        },
        order: [['id', 'ASC']],
      });
    }

    static async dueToday() {
      return this.findAll({
        where: {
          dueDate: new Date().toISOString().split('T')[0],
          completed: false,
        },
        order: [['id', 'ASC']],
      });
    }

    static async remove(id) {
      return this.destroy({
        where: {
          id: id,
        },
      });
    }

    deleteTodo() {
      return this.removeTask();
    }

    static completed() {
      return this.findAll({
        where: {
          completed: true,
        },
        order: [['id', 'ASC']],
      });
    }

    setCompletionStatus(bool) {
      return this.update({ completed: bool });
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Todo',
    }
  );

  return Todo;
};
