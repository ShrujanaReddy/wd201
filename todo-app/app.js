const express = require('express');
const csrf = require("tiny-csrf");
const app = express();
const { Todo } = require('./models');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(cookieParser('ssh! some secret string'));
app.use(csrf('this_should_be_32_character_long', ['POST', 'PUT', 'DELETE']));

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
  try {
    const [allTodos, overdueTodos, dueTodayTodos, dueLaterTodos, completed] = await Promise.all([
      Todo.getTodos(),
      Todo.overdue(),
      Todo.dueToday(),
      Todo.dueLater(),
      Todo.completed(),
    ]);

    if (req.accepts('html')) {
      res.render('index', {
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completed,
        csrfToken: req.csrfToken(),
      });
    } else {
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
    res.status(500).send('Internal Server Error');
  }
});

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.getTodos();
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.post('/todos', async (req, res) => {
  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
    });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    const updatedTodo = await todo.setCompletionStatus(req.body.completed);
    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    await Todo.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

module.exports = app;
