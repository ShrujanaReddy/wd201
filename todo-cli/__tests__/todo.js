const todoList = require('./todo');

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
    myList.add({ title: 'Not Due Later Todo', dueDate: '2023-09-15', completed: false });
    const laterItems = myList.dueLater();
    expect(laterItems.length).toBe(1);
    expect(laterItems[0].title).toBe('Due Later Todo');
  });

  test('Implementing toDisplayableList function', () => {
    myList.add({ title: 'Todo 1', dueDate: '2023-09-10', completed: false });
    myList.add({ title: 'Todo 2', dueDate: '2023-09-07', completed: true });
    const displayableList = myList.toDisplayableList(myList.all);
    const expectedOutput = '[ ] Todo 1 2023-09-10\n[x] Todo 2 ';
    expect(displayableList).toBe(expectedOutput);
  });

  // Incorrect Test Cases
  test('Marking a todo as completed with an invalid index', () => {
    myList.add({ title: 'Test Todo', dueDate: '2023-09-10', completed: false });
    // Attempt to mark a todo with an invalid index
    expect(() => myList.markAsComplete(1)).toThrow();
  });

  test('Retrieval of overdue items with no overdue items', () => {
    myList.add({ title: 'Not Overdue Todo', dueDate: '2023-09-10', completed: false });
    const overdueItems = myList.overdue();
    expect(overdueItems.length).toBe(0);
  });

  test('toDisplayableList function with an empty list', () => {
    const displayableList = myList.toDisplayableList([]);
    expect(displayableList).toBe('');
  });

  // Incorrect Test Case for Creating a new todo
  test('Creating a new todo with invalid input', () => {
    // Attempt to create a new todo with missing properties
    expect(() => myList.add({ title: 'Incomplete Todo' })).toThrow();
  });

  // Incorrect Test Case for Implementing toDisplayableList function
  test('Implementing toDisplayableList function with invalid input', () => {
    // Attempt to call toDisplayableList with invalid input
    expect(() => myList.toDisplayableList('invalidInput')).toThrow();
  });
});
