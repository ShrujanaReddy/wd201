const todoList = require('../todo');

describe('Todo List Tests', () => {
  let myList;

  beforeEach(() => {
    myList = todoList();
  });

  test('Creating a new todo', () => {
    myList.add({ title: 'Test Todo', dueDate: '2023-09-10', completed: false });
    expect(myList.all.length).toBe(1);
  });

  test('Marking a todo as completed', () => {
    myList.add({ title: 'Test Todo', dueDate: '2023-09-10', completed: false });
    myList.markAsComplete(0);
    expect(myList.all[0].completed).toBe(true);
  });

  test('Retrieval of overdue items', () => {
    myList.add({ title: 'Overdue Todo', dueDate: '2023-08-01', completed: false });
    myList.add({ title: 'Not Overdue Todo', dueDate: '2023-09-10', completed: false });
    const overdueItems = myList.overdue();
    expect(overdueItems.length).toBe(1);
    expect(overdueItems[0].title).toBe('Overdue Todo');
  });

  test('Retrieval of due today items', () => {
    myList.add({ title: 'Due Today Todo', dueDate: '2023-09-07', completed: false });
    myList.add({ title: 'Not Due Today Todo', dueDate: '2023-09-10', completed: false });
    const todayItems = myList.dueToday();
    expect(todayItems.length).toBe(1);
    expect(todayItems[0].title).toBe('Due Today Todo');
  });

  test('Retrieval of due later items', () => {
    myList.add({ title: 'Due Later Todo', dueDate: '2023-09-10', completed: false });
    myList.add({ title: 'Not Due Later Todo', dueDate: '2023-09-06', completed: false });
    const laterItems = myList.dueLater();
    expect(laterItems.length).toBe(1);
    expect(laterItems[0].title).toBe('Due Later Todo');
  });
});
