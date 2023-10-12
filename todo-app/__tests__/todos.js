const request=require("supertest")
var cheerio=require("cheerio")
const db=require("../models/index")
const app=require("../app")
let server,agent
function extractCsrfToken(res) {
  var $=cheerio.load(res.text)
  return $("[name=_csrf]").val()
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
     test("creates new todo",async () => {
      const res=await agent.get("/")
      const csrfToken=extractCsrfToken(res)
        const response=await agent.post('/todos').send({
            'title':'buy ',
            dueDate:new Date().toISOString(),
            completed:false,
            "_csrf":csrfToken
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
  let res = await agent.get("/");
  let csrfToken = extractCsrfToken(res);
  const createResponse = await agent.post('/todos').send({
    title: 'Buy groceries',
    dueDate: new Date().toISOString(),
    completed: false,
    "_csrf": csrfToken,
  });
  expect(createResponse.statusCode).toBe(201); 
  const createdTodo = createResponse.body; 
  const markCompleteResponse = await agent.put(`/todos/${createdTodo.id}`).send({
    completed: true,
    "_csrf": csrfToken,
  });
  expect(markCompleteResponse.statusCode).toBe(200);
  const markedTodoResponse = await agent.get(`/todos/${createdTodo.id}`);
  expect(markedTodoResponse.statusCode).toBe(200); 
  const markedTodo = markedTodoResponse.body; 
  expect(markedTodo.completed).toBe(true);
});
test("Mark a sample overdue task as completed", async () => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);
  const createTaskResponse = await agent.post("/todos").send({
    title: "Yesterday's Task",
    dueDate: pastDate.toISOString().split("T")[0],
    completed: false,
  });
  expect(createTaskResponse.status).toBe(200); 
  const taskId = createTaskResponse.body.id;  


  const markCompletedResponse = await agent.put(`/todos/${taskId}`).send({
    completed: true,
  });
  expect(markCompletedResponse.status).toBe(200); 


  const getTaskResponse = await agent.get(`/todos/${taskId}`);
  expect(getTaskResponse.status).toBe(200);
  expect(getTaskResponse.body.completed).toBe(true);
});
});
