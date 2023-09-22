const request=require("supertest")
const db=require("../models/index")
const app=require("../app")
let server,agent

describe("Todo test suite",()=> {
     beforeAll(async ()=>{
        await db.sequelize.sync({force:true})
        server=app.listen(3000,()=>{ })
        agent=request.agent(server)
     });
     afterAll(async ()=>{
        await db.sequelize.close();
        server.close()
     })
     test("responds with json at /todos",async () => {
        const response=await agent.post('/todos').send({
            'title':'buy ',
            dueDate:new Date().toISOString(),
            completed:false
        });
        expect(response.statusCode).toBe(200);
        expect(response.header["content-type"]).toBe("application/json; charset=utf-8");
        const parsedResponse=JSON.parse(response.text);
        expect(parsedResponse.id).toBeDefined();
     })

     test('marks a todo as complete', async () => {
     const createResponse = await agent.post('/todos').send({
      title: 'Buy groceries',
      dueDate: new Date().toISOString(),
      completed: false,
    })
    const createdTodo = JSON.parse(createResponse.text);
    const markCompleteResponse = await agent.put(`/todos/${createdTodo.id}/markAsCompleted`);
    expect(markCompleteResponse.statusCode).toBe(200);
    const markedTodo = JSON.parse(markCompleteResponse.text);
    expect(markedTodo.completed).toBe(true);
    })

test('deletes a todo by ID if it exists and sends a boolean response', async () => {
  const createResponse = await agent.post('/todos').send({
    title: 'To be deleted',
    dueDate: new Date().toISOString(),
    completed: false,
  })
  const createdTodo = JSON.parse(createResponse.text)
  const deleteResponse = await agent.delete(`/todos/${createdTodo.id}`)
  const deletionResult = JSON.parse(deleteResponse.text)
  expect(deletionResult.success).toBe(true)
  expect(deleteResponse.statusCode).toBe(200);
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
  })
})