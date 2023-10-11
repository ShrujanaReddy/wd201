'use strict';
const {
  Model,Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static addTodo({title,dueDate}) {
      return this.create({title:title,dueDate:dueDate,completed:false})
    }
    markAsCompleted() {
      return this.update({completed:true})
    }
    static getTodos() {
      return this.findAll()
    }
    static async dueLater() {
      return this.findAll({
        where : {
          dueDate:{
            [Op.gt]:new Date().toLocaleDateString("en-CA"),
          },
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static async overdue() {
      return this.findAll({
        where : {
          dueDate:{
            [Op.lt]:new Date().toLocaleDateString("en-CA"),
          },
          completed:false,
        },
        order: [["id", "ASC"]],
      });
    }
    static async dueToday() {
      return this.findAll({
        where : {
          dueDate:{
            [Op.eq]:new Date().toLocaleDateString("en-CA"),
          },
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static async remove(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }
    deletetodo() {
      return this.removetask();
    }
    static completed() {
      return this.findAll({
        where: {
          completed: true,
        },
        order: [["id", "ASC"]],
      });
    }
    setCompletionStatus(bool) {
      return this.update({ completed: bool });
    }
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};