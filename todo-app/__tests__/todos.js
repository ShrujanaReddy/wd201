const request=require("supertest")
var cheerio=require("cheerio")
const db=require("../models/index")
const app=require("../app")
let server,agent
function extractCsrfToken(res) {
  var $=cheerio.load(res.text)
  return $("[name=_csrf]").val()
}
const login=async (agent,username,password)=>{
  let res=await agent.get("/login")
  let csrfToken=extractCsrfToken(res)
  res=await agent.post("/session").send({
    email:username,
    password:password,
    _csrf:csrfToken
  })
}
describe("Todo test suite",  ()=> {
     beforeAll(async ()=>{
        await db.sequelize.sync({force:true})
        server=app.listen(5000,()=>{ })
        agent=request.agent(server)
     });
     afterAll(async ()=>{
        await db.sequelize.close();
        server.close()
     })
     test("Sign up",async ()=>{
      let res=await agent.get("/signup")
      const csrfToken=extractCsrfToken(res)
      res=await agent.post("/users").send({
        firstName:"Test",
        lastName:"User A",
        email:"usera@test.com",
        password:"12345678",
        _csrf:csrfToken,
      })
      expect(res.statusCode).toBe(302)
     })

     test("Sign out",async ()=>{
      let res=await agent.get("/todos")
      expect(res.statusCode).toBe(200)
      res=await agent.get("/signout")
      expect(res.statusCode).toBe(302)
      res=await agent.get("/todos")
      expect(res.statusCode).toBe(302)
     })

     test("creates new todo",async () => {
      const agent=request.agent(server)
      await login(agent,"usera@test.com","12345678")
      const res=await agent.get("/todos")
      const csrfToken=extractCsrfToken(res)
        const response=await agent.post('/todos').send({
            title:'buy ',
            dueDate:new Date().toISOString(),
            completed:false,
            _csrf:csrfToken
        });
        expect(response.statusCode).toBe(302);
     })
     test("Not create a todo item with an empty dueDate", async () => {
  const res = await agent.post("/todos").send({
    title: "Task with Empty Due Date",
    dueDate: "",
    completed: false,
  });
  expect(res.status).toBe(500); 
});
  test('marks a todo as complete', async () => {
  // First, create a to-do item
  const agent=request.agent(server)
  await login(agent,"usera@test.com","12345678")
  let res = await agent.get("/todos");
  let csrfToken = extractCsrfToken(res);
  const createResponse = await agent.post('/todos').send({
    title: 'Buy groceries',
    dueDate: new Date().toISOString().split("T")[0],
    completed: false,
    _csrf: csrfToken,
  });
  const groupedTodosResponse=await agent.get("/todos").set("Accept","application/json")
  const parsedGroupedResponse=JSON.parse(groupedTodosResponse.text)
  const dueTodayCount=parsedGroupedResponse.dueTodayTodos.length
  const latestTodo=parsedGroupedResponse.dueTodayTodos[dueTodayCount-1]

  res=await agent.get("/todos")
  csrfToken=extractCsrfToken(res)

  const markCompleteResponse=await agent.put(`/todos/${latestTodo.id}/`).send({
    _csrf:csrfToken,
    completed:true,
  })
  const parsedUpdateResponse=JSON.parse(markCompleteResponse.text)
  expect(parsedUpdateResponse.completed).toBe(true)
})
test("Mark a sample overdue task as completed", async () => {
  const agent=request.agent(server)
  await login(agent,"usera@test.com","12345678")
  let res = await agent.get("/todos");
  let csrfToken = extractCsrfToken(res);
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);
  const createTaskResponse = await agent.post("/todos").send({
    title: "Yesterday's Task",
    dueDate: pastDate.toISOString().split("T")[0],
    completed: false,
    _csrf: csrfToken,
  });
  const groupedTodosResponse=await agent.get("/todos").set("Accept","application/json")
  const parsedGroupedResponse=JSON.parse(groupedTodosResponse.text)
  const dueTodayCount=parsedGroupedResponse.overdueTodos.length
  const latestTodo=parsedGroupedResponse.overdueTodos[dueTodayCount-1]

  res=await agent.get("/todos")
  csrfToken=extractCsrfToken(res) 


  const markCompletedResponse = await agent.put(`/todos/${latestTodo.id}`).send({
    _csrf:csrfToken,
    completed: true,
  });
  const parsedUpdateResponse=JSON.parse(markCompletedResponse.text)
  expect(parsedUpdateResponse.completed).toBe(true)

  // const getTaskResponse = await agent.get(`/todos/${taskId}`);
  // expect(getTaskResponse.status).toBe(200);
  // expect(getTaskResponse.body.completed).toBe(true);
});

test("Create a sample task due today", async () => {
  const res = await agent.post("/todos").send({
    title: "Complete Today's Task",
    dueDate: new Date().toISOString().split("T")[0],
    completed: false,
  });
  expect(res.status).toBe(500); 
});
test("Creating a sample task due later", async () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  const res = await agent.post("/todos").send({
    title: "Plan for Tomorrow",
    dueDate: futureDate.toISOString().split("T")[0],
    completed: false,
  });
  expect(res.status).toBe(500); 
});
test("Create a sample overdue task", async () => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);
  const res = await agent.post("/todos").send({
    title: "Yesterday's Task",
    dueDate: pastDate.toISOString().split("T")[0],
    completed: false,
  });
  expect(res.status).toBe(500); 
});
test("Delete a todo item", async () => {
  // Create a new todo
  const agent=request.agent(server)
  await login(agent,"usera@test.com","12345678")
  let res = await agent.get("/todos");
  let csrfToken = extractCsrfToken(res);
  const createTodoResponse = await agent.post("/todos").send({
    _csrf:csrfToken,
    title: "Todo to Delete",
    dueDate: new Date().toISOString().split("T")[0],
    completed: false,
  });
  const groupedTodosResponse=await agent.get("/todos").set("Accept","application/json")
  const parsedGroupedResponse=JSON.parse(groupedTodosResponse.text)
  const dueTodayCount=parsedGroupedResponse.dueTodayTodos.length
  const latestTodo=parsedGroupedResponse.dueTodayTodos[dueTodayCount-1]

  res=await agent.get("/todos")
  csrfToken=extractCsrfToken(res)

  const deleteResponse=await agent.delete(`/todos/${latestTodo.id}/`).send({
    _csrf:csrfToken,
  })
  expect(deleteResponse.statusCode).toBe(200)
})
test("Accessing Other User's Todos", async () => {
  // Create two users, userA and userB
  const userAAgent = request.agent(server);
  const userBAgent = request.agent(server);

  // Sign up userA
  let res = await userAAgent.get("/signup");
  const userACsrfToken = extractCsrfToken(res);
  res = await userAAgent.post("/users").send({
    firstName: "UserA",
    lastName: "Test",
    email: "usera1@test.com",
    password: "12345678",
    _csrf: userACsrfToken,
  });
  expect(res.statusCode).toBe(302);

  // Sign up userB
  res = await userBAgent.get("/signup");
  const userBCsrfToken = extractCsrfToken(res);
  res = await userBAgent.post("/users").send({
    firstName: "UserB",
    lastName: "Test",
    email: "userb1@test.com",
    password: "12345678",
    _csrf: userBCsrfToken,
  });
  expect(res.statusCode).toBe(302);

  // Log in as userA
  res = await login(userAAgent, "usera@test.com", "12345678");

  // Create a todo for userA
  res = await userAAgent.get("/todos");
  const userATodoCsrfToken = extractCsrfToken(res);
  const createTodoResponse = await userAAgent.post('/todos').send({
    title: 'UserA Task',
    dueDate: new Date().toISOString(),
    completed: false,
    _csrf: userATodoCsrfToken,
  });
  expect(createTodoResponse.statusCode).toBe(302);

  // Log in as userB
  res = await login(userBAgent, "userb@test.com", "12345678");

  // Attempt to access userA's todos
  const userBTodosResponse = await userBAgent.get("/todos").set("Accept", "application/json");
  const userBTodos = JSON.parse(userBTodosResponse.text).allTodos;

  // Verify that userB should not see userA's todos
  expect(userBTodos).toHaveLength(0);
})



    /* test('marks a todo as complete', async () => {
      let res=await agent.get("/")
      let csrfToken=extractCsrfToken(res)
      await agent.post('/todos').send({
      title: 'Buy groceries',
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf":csrfToken,
    })
    /*const createdTodo = JSON.parse(createResponse.text);
    const markCompleteResponse = await agent.put(`/todos/${createdTodo.id}/markAsCompleted`);
    expect(markCompleteResponse.statusCode).toBe(200);
    const markedTodo = JSON.parse(markCompleteResponse.text);
    expect(markedTodo.completed).toBe(true);*/
   /* const groupedTodosResponse= await agent.get("/").set("Accept","application/json")
    const parsedGroupedResponse=JSON.parse(groupedTodosResponse.text)
    const dueTodayCount=parsedGroupedResponse.dueTodayTodos.length;
    const latestTodo=parsedGroupedResponse.dueTodayTodos[dueTodayCount-1]
    res= await agent.get("/")
    csrfToken=extractCsrfToken(res)
    const markCompleteResponse= await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf:csrfToken,
    })
    const parsedUpdateResponse=JSON.parse(markCompleteResponse.text)
    expect(parsedUpdateResponse.statusCode).toBe(200)
    })*/
    
    /*
test('deletes a todo by ID if it exists and sends a boolean response', async () => {
  const response = await agent.post('/todos').send({
    title: 'To be deleted',
    dueDate: new Date().toISOString(),
    completed: false,
  })
  const Parsedresponse = JSON.parse(response.text);
  const todoID = Parsedresponse.id;
  const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
  const parsedDeleteResponse = JSON.parse(deleteResponse.text);
  expect(parsedDeleteResponse).toBe(true);
})
    test('gets all todos', async () => {
    await agent.post('/todos').send({
      title: 'Task 1',
      dueDate: new Date().toISOString(),
      completed: false,
    });
    await agent.post('/todos').send({
      title: 'Task 2',    
      dueDate: new Date().toISOString(),
      completed: true,
    })
    const getAllResponse = await agent.get('/todos');
    expect(getAllResponse.statusCode).toBe(200);
    const allTodos = JSON.parse(getAllResponse.text);
    expect(Array.isArray(allTodos)).toBe(true);
  })*/
})