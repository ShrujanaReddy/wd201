const todoList = require('../todo');

describe('Todo List', () => {
  let todos;

  beforeEach(() => {
    todos = todoList();
    const formattedDate = (d) => {
      return d.toISOString().split('T')[0];
    };

    var dateToday = new Date();
    const today = formattedDate(dateToday);
    const yesterday = formattedDate(
      new Date(new Date().setDate(dateToday.getDate() - 1))
    );
    const tomorrow = formattedDate(
      new Date(new Date().setDate(dateToday.getDate() + 1))
    );

    todos.add({ title: 'Submit assignment', dueDate: yesterday, completed: false });
    todos.add({ title: 'Pay rent', dueDate: today, completed: true });
    todos.add({ title: 'Service Vehicle', dueDate: today, completed: false });
    todos.add({ title: 'File taxes', dueDate: tomorrow, completed: false });
    todos.add({ title: 'Pay electric bill', dueDate: tomorrow, completed: false });
  });

  it('should create a new todo', () => {
    todos.add({ title: 'New task', dueDate: '2023-09-08', completed: false });
    expect(todos.all.length).toBe(6);
  });

  it('should mark a todo as completed', () => {
    todos.markAsComplete(0);
    expect(todos.all[0].completed).toBe(true);
  });

  it('should retrieve overdue items', () => {
    const overdueItems = todos.overdue();
    expect(overdueItems.length).toBe(1);
    expect(overdueItems[0].title).toBe('Submit assignment');
  });

  it('should retrieve due today items', () => {
    const dueTodayItems = todos.dueToday();
    expect(dueTodayItems.length).toBe(2);
    expect(dueTodayItems[0].title).toBe('Pay rent');
    expect(dueTodayItems[1].title).toBe('Service Vehicle');
  });

  it('should retrieve due later items', () => {
    const dueLaterItems = todos.dueLater();
    expect(dueLaterItems.length).toBe(2);
    expect(dueLaterItems[0].title).toBe('File taxes');
    expect(dueLaterItems[1].title).toBe('Pay electric bill');
  });

  it('should implement toDisplayableList function', () => {
    const list = [
      { title: 'Task 1', dueDate: '2023-09-08', completed: false },
      { title: 'Task 2', dueDate: '2023-09-09', completed: true },
    ];
    const displayableList = todos.toDisplayableList(list);
    const expectedList = '[ ] Task 1 2023-09-08\n[x] Task 2 2023-09-09';

    expect(displayableList).toBe(expectedList);
  });
});
