'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // Define associations if needed
    }

    static async addTask(params) {
      try {
        const todo = await Todo.create(params);
        return todo;
      } catch (error) {
        throw new Error('Error adding task: ' + error.message);
      }
    }

    static async showList() {
      console.log('My Todo list \n');

      console.log('Overdue');
      const overdueTodos = await Todo.overdue();
      overdueTodos.forEach((todo) => {
        console.log(todo.displayableString());
      });

      console.log('\n');

      console.log('Due Today');
      const dueTodayTodos = await Todo.dueToday();
      dueTodayTodos.forEach((todo) => {
        console.log(todo.displayableString());
      });

      console.log('\n');

      console.log('Due Later');
      const dueLaterTodos = await Todo.dueLater();
      dueLaterTodos.forEach((todo) => {
        console.log(todo.displayableString());
      });
    }

    static async overdue() {
      try {
        const currentDate = new Date();
        return await Todo.findAll({
          where: {
            dueDate: { [Op.lt]: currentDate },
          },
        });
      } catch (error) {
        throw new Error('Error fetching overdue tasks: ' + error.message);
      }
    }

    static async dueToday() {
      try {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set time to start of the day
        return await Todo.findAll({
          where: {
            dueDate: { [Op.eq]: currentDate },
          },
        });
      } catch (error) {
        throw new Error('Error fetching tasks due today: ' + error.message);
      }
    }

    static async dueLater() {
      try {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set time to start of the day
        return await Todo.findAll({
          where: {
            dueDate: { [Op.gt]: currentDate },
          },
        });
      } catch (error) {
        throw new Error('Error fetching tasks due later: ' + error.message);
      }
    }

    static async markAsComplete(id) {
      try {
        const [updatedRowCount] = await Todo.update(
          { completed: true },
          {
            where: {
              id: id,
            },
          }
        );

        if (updatedRowCount === 0) {
          throw new Error('Task not found');
        }

        return true;
      } catch (error) {
        throw new Error('Error marking task as complete: ' + error.message);
      }
    }

    displayableString() {
   let checkbox = this.completed ? '[x]' : '[ ]';

  if (this.completed) {
    // For completed todos, no need to display the due date
    return `${this.id}. ${checkbox} ${this.title}`;
  }

  if (this.dueDate instanceof Date) {
    // For todos with a valid date, format and display the due date
    let formattedDueDate = this.formatDate(this.dueDate);
    return `${this.id}. ${checkbox} ${this.title} ${formattedDueDate}`;
  }

  // For todos with no date information, just display the title
  return `${this.id}. ${checkbox} ${this.title}`;
}

formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
