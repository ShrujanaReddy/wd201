const express= require('express')
var csrf=require("tiny-csrf")
const app=express()
const {Todo}=require('./models')
const bodyParser=require('body-parser')
var cookieParser=require("cookie-parser")
app.use(bodyParser.json())
const path=require('path')
app.use(express.urlencoded({extended:false}))
app.use(cookieParser("ssh! some secret string"))
app.use(csrf("this_should_be_32_character_long",["POST","PUT","DELETE"]))

app.set("view engine","ejs")

app.use(express.static(path.join(__dirname,'public')))
app.get("/", async (req, res) => {
  try {
    // Fetch all the lists in parallel
    const [allTodos, overdueTodos, dueTodayTodos, dueLaterTodos] = await Promise.all([
      Todo.getTodos(),
      Todo.overdue(),
      Todo.dueToday(),
      Todo.dueLater(),
    ]);

    if (req.accepts("html")) {
      // Render HTML response
      res.render("index", {
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        csrfToken: req.csrfToken(),
      });
    } else {
      // Respond with JSON
      res.json({
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



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
        return res.redirect("/")
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
app.delete("/todos/:id", async function (req, res) {
  console.log("We must delete a Todo with ID: ", req.params.id)
  try {
    await Todo.remove(req.params.id)
    return res.json({success:true})
  }
  catch (error) {
    return res.status(422).json(error)
  }
})

module.exports=app;
