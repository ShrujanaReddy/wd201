const express= require('express')
const app=express()
const {Todo}=require('./models')
const bodyParser=require('body-parser')
app.use(bodyParser.json())
const path=require('path')

app.set("view engine","ejs")

app.use(express.static(path.join(__dirname,'public')))
app.get("/",async (req,res) => {
    const allTodos=await Todo.getTodos();
    if(req.accepts("html")) {
        res.render('index',{
            allTodos
        })
    }
    else {
        res.json({
            allTodos
        })
    }
})


app.get("/todos",async (req,res) => {
    //res.send("Hello World")
    console.log("Todos list")
    try {
        const todo=await Todo.getTodos()
        return res.json(todo)
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
})
app.post("/todos",async (req,res) => {
    console.log("Creating a todo",req.body)
    try {
        const todo=await Todo.addTodo({title:req.body.title,dueDate:req.body.dueDate,completed:false})
        return res.json(todo)
    }
    catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
    
})
app.put("/todos/:id/markAsCompleted",async (req,res) => {
    console.log("We must update a todo with id:",req.params.id)
    const todo=await Todo.findByPk(req.params.id)
    try {
        const updatedTodo=await todo.markAsCompleted()
        return res.json(updatedTodo)
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
})
app.delete("/todos/:id", async function (request, response) {
  console.log("We must delete a Todo with ID: ", request.params.id);
  const delete_todo = await Todo.destroy({ where: { id: request.params.id } });
  response.send(delete_todo ? true : false);
})

module.exports=app;