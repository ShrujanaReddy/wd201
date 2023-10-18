const express= require('express')
var csrf=require("tiny-csrf")
const app=express()
const {Todo,User}=require('./models')
const bodyParser=require('body-parser')
var cookieParser=require("cookie-parser")
app.use(bodyParser.json())
const path=require('path')
const passport=require('passport')
const connectEnsureLogin=require('connect-ensure-login')
const session=require('express-session')
const LocalStrategy=require('passport-local')
const bcrypt=require('bcrypt')
const flash = require("connect-flash")
//const { has } = require('cheerio/lib/api/traversing')
app.use(flash());
app.set("views", path.join(__dirname, "views"))
const saltRounds=10;
app.use(express.urlencoded({extended:false}))
app.use(cookieParser("ssh! some secret string"))
app.use(csrf("this_should_be_32_character_long",["POST","PUT","DELETE"]))
app.use(session({
  secret:"my-super-secret-key-2121323131312",
  cookie:{
    maxAge:24*60*60*1000 //24hrs
  }
}))

app.use(function (request, response, next) {
                response.locals.messages = request.flash();
                next();
            });


app.use(passport.initialize())
app.use(passport.session())

app.set("view engine","ejs")

app.use(express.static(path.join(__dirname,'public')))

passport.use(new LocalStrategy({
  usernameField:'email',
  passwordField:'password'
},(username,password,done)=>{
  User.findOne({where:{email:username}})
  .then(async (user)=>{
    const result=await bcrypt.compare(password,user.password)
    if(result)
    return done(null,user)
    else
    return done(null,false,{message:"Invalid password"})
  }).catch((error)=>{
    return done(error)
  })
}))
passport.serializeUser((user,done)=>{
  console.log("Serializing user in session",user.id)
  done(null,user.id)
})
passport.deserializeUser((id,done)=>{
  User.findByPk(id)
  .then(user=>{
    done(null,user)
  }).catch(error=>{
    done(error,null)
  })
})

app.get("/", async (request, response) => {
  if(request.isAuthenticated()){
     return response.redirect("/todos")
    }
       response.render("index", { 
         title: "Todo List", 
         csrfToken: request.csrfToken(), 
       })
})



app.get("/todos",connectEnsureLogin.ensureLoggedIn(),async (req,res) => {
    //res.send("Hello World")
    /*console.log("Todos list")
    try {
        const todo=await Todo.getTodos()
        return res.json(todo)
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }*/
    const loggedInUser=req.user.id;
    try {
    // Fetch all the lists in parallel
    const [allTodos, overdueTodos, dueTodayTodos, dueLaterTodos,completed] = await Promise.all([
      Todo.getTodos(loggedInUser),
      Todo.overdue(loggedInUser),
      Todo.dueToday(loggedInUser),
      Todo.dueLater(loggedInUser),
      Todo.completed(loggedInUser),
    ]);

    if (req.accepts("html")) {
      // Render HTML response
      res.render("todo", {
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completed,
        csrfToken: req.csrfToken(),
      });
    } else {
      // Respond with JSON
      res.json({
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completed,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
})



app.get("/signup",(req,res)=>{
  res.render("signup",{title:'Signup',csrfToken:req.csrfToken()})
})

app.post("/users",async (req,res)=>{
  const hashedPwd=await bcrypt.hash(req.body.password,saltRounds)
  console.log(hashedPwd)
  try {
    const user=await User.create({
    firstName:req.body.firstName,
    lastName: req.body.lastName,
    email:req.body.email,
    password:hashedPwd
  })
  req.login(user,(err)=>{
    if(err)
    console.log(err)
    res.redirect("/todos")
  })
  } catch(error) {
    console.log(error)
  }
  
})

app.get("/login",(req,res)=>{
  res.render("login",{title:"Login",csrfToken:req.csrfToken()})
})

app.post("/session",passport.authenticate('local',{failureRedirect:"/login",failureFlash: true,}),(req,res)=>{
  console.log(req.user)
  res.redirect("/todos")
})

app.get("/signout",(req,res)=>{
  req.logout((err)=>{
    if(err) 
    return next(err)
    res.redirect("/")
  })
})

app.post("/todos",connectEnsureLogin.ensureLoggedIn(),async (req,res) => {
    console.log("Creating a todo",req.body)
    try {
        const todo=await Todo.addTodo({title:req.body.title,dueDate:req.body.dueDate,userId:req.user.id})
        return res.redirect("/")
    }
    catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
    
})
app.put("/todos/:id",connectEnsureLogin.ensureLoggedIn(),async (req,res) => {
    console.log("We must update a todo with id:",req.params.id)
    const todo=await Todo.findByPk(req.params.id)
    try {
        const updatedTodo=await todo.setCompletionStatus(req.body.completed)
        return res.json(updatedTodo)
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
})
/*app.get("/todos/:id",async (req,res) => {
    console.log("We must update a todo with id:",req.params.id)
    
    try {
        //const updatedTodo=await todo.setCompletionStatus(req.body.completed)
        const todo=await Todo.findByPk(req.params.id)
        return res.json(todo)
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
})*/
app.delete("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async function (req, res) {
  console.log("We must delete a Todo with ID: ", req.params.id)
  const loggedInUser=req.user.id
  try {
    await Todo.remove(req.params.id,loggedInUser)
    return res.json({success:true})
  }
  catch (error) {
    return res.status(422).json(error)
  }
})



module.exports=app;
