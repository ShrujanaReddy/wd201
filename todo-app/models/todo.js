'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // Define associations here if needed.
      Todo.belongsTo(models.User,{
        foreignKey:'userId'
      })
    }

    static addTodo({ title, dueDate,userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId
      });
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    static getTodos(userId) {
      return this.findAll({
        where:{
          userId
        }
      });
    }

    static async dueLater(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toISOString().split('T')[0],
          },
          userId,
          completed: false,
        },
        order: [['id', 'ASC']],
      });
    }

    static async overdue(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().split('T')[0],
          },
          userId,
          completed: false,
        },
        order: [['id', 'ASC']],
      });
    }

    static async dueToday(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toISOString().split('T')[0],
          },
        userId,
        completed: false,
      },
        order: [['id', 'ASC']],
      });
    }

    static async remove(id,userId) {
      return this.destroy({
        where: {
          id: id,
          userId,
        },
      });
    }

    deleteTodo() {
      return this.removeTask();
    }

    static completed(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
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
