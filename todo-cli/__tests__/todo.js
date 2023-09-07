let todoList;
let all, markAsComplete, add, overdue, dueToday, dueLater;

beforeAll(() => {
  todoList = require("../todo");
  ({ all, markAsComplete, add, overdue, dueToday, dueLater } = todoList());

  const today = new Date();
  const oneDay = 60 * 60 * 24 * 1000;
  const initialTodos = [
    {
      title: "Complete assignment",
      completed: false,
      dueDate: new Date(today.getTime() - 1 * oneDay).toLocaleDateString("en-CA"),
    },
    {
      title: "Go for shopping",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    },
    {
      title: "Complete project",
      completed: false,
      dueDate: new Date(today.getTime() + 1 * oneDay).toLocaleDateString("en-CA"),
    },
  ];
  initialTodos.forEach((todo) => add(todo));
});

describe("Todo test cases", () => {
  test("Add new todo", () => {
    let prevLength = all.length;

    add({
      title: "Take the test",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });

    expect(all.length).toEqual(prevLength + 1);
  });

  test("Todo mark as complete", () => {
    expect(all[0].completed).toEqual(false);
    markAsComplete(0);
    expect(all[0].completed).toEqual(true);
  });

  test("Test for overdue", () => {
    const initialOverdueItems = overdue();
    const today = new Date().toISOString().split("T")[0];
    const overdueTodo = {
      title: "Overdue Todo",
      completed: false,
      dueDate: new Date(
        new Date(today).getTime() - 1 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("en-CA"),
    };
    add(overdueTodo);

    expect(overdue().length).toBe(initialOverdueItems.length + 1);
  });

  test("Test due today", () => {
    const initialDueTodayItems = dueToday();
    const today = new Date().toISOString().split("T")[0];
    const dueTodayTodo = {
      title: "Due Today Todo",
      completed: false,
      dueDate: today,
    };
    add(dueTodayTodo);

    expect(dueToday().length).toBe(initialDueTodayItems.length + 1);
  });

  test("Test for due later", () => {
    const initialDueLaterItems = dueLater();
    const dueLaterTodo = {
      title: "Due Later Todo",
      completed: false,
      dueDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
    add(dueLaterTodo);

    expect(dueLater().length).toBe(initialDueLaterItems.length + 1);
  });
});
