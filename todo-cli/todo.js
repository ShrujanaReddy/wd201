// todo.js

const todoList = () => {
  const all = [];
  const today = new Date();

  const formatDate = (date) => {
    // Ensure date is in 'YYYY-MM-DD' format
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const add = (todoItem) => {
    // Enforce 'YYYY-MM-DD' format for dueDate
    if (todoItem.dueDate) {
      const dueDate = new Date(todoItem.dueDate);
      if (!isNaN(dueDate)) {
        todoItem.dueDate = formatDate(dueDate);
      }
    }
    all.push(todoItem);
  };

  const markAsComplete = (index) => {
    all[index].completed = true;
  };

  const overdue = () => {
    return all.filter((element) => element.dueDate < formatDate(today) && !element.completed);
  };

  const dueToday = () => {
    return all.filter((element) => element.dueDate === formatDate(today) && !element.completed);
  };

  const dueLater = () => {
    return all.filter((element) => element.dueDate > formatDate(today) && !element.completed);
  };

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
  };
};

module.exports = todoList;
