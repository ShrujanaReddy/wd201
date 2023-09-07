let todoList = require("../todo");

describe("Todo List Tests", () => {
  let myList;

  beforeEach(() => {
    myList = todoList();
    const today = new Date().toISOString().split("T")[0];
    const oneDay = 60 * 60 * 24 * 1000;
    [
      {
        title: "Complete assignment",
        completed: false,
        dueDate: new Date(new Date(today).getTime() - oneDay)
          .toISOString()
          .split("T")[0],
      },
      {
        title: "Go for shopping",
        completed: false,
        dueDate: today,
      },
      {
        title: "Complete project",
        completed: false,
        dueDate: new Date(new Date(today).getTime() + oneDay)
          .toISOString()
          .split("T")[0],
      },
    ].forEach((task) => myList.add(task));
  });

  test("Add new todo", () => {
    let prevLength = myList.all.length;

    myList.add({
      title: "Take the test",
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
    });

    expect(myList.all.length).toEqual(prevLength + 1);
  });

  test("Todo mark as complete", () => {
    expect(myList.all[0].completed).toEqual(false);
    myList.markAsComplete(0);
    expect(myList.all[0].completed).toEqual(true);
  });

  test("Test for overdue", () => {
    const overdueItems = myList.overdue();
    const today = new Date().toISOString().split("T")[0];
    myList.add({
      title: "Overdue Todo",
      completed: false,
      dueDate: new Date(
        new Date(today).getTime() - 1 * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0],
    });

    expect(myList.overdue().length).toBe(overdueItems.length + 1);
  });

  test("Test due today", () => {
    const dueTodayItems = myList.dueToday();
    const today = new Date().toISOString().split("T")[0];
    myList.add({
      title: "Due Today Todo",
      completed: false,
      dueDate: today,
    });

    expect(myList.dueToday().length).toBe(dueTodayItems.length + 1);
  });

  test("Test for due later", () => {
    const dueLaterItems = myList.dueLater();
    myList.add({
      title: "Due Later Todo",
      completed: false,
      dueDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });

    expect(myList.dueLater().length).toBe(dueLaterItems.length + 1);
  });
});
