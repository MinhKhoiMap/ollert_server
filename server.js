const http = require("http");

const checkAuth = require("./authenticate");

const userController = require("./controllers/userController");
const boardController = require("./controllers/boardController");
const todoController = require("./controllers/todoController");
const taskController = require("./controllers/taskController");
const passCors = require("./cors");

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  passCors(res);
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, DELETE, PUT, POST, GET",
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }
  if (req.url === "/api/users") {
    switch (req.method) {
      case "POST":
        userController.createUser(req, res);
        break;
      case "PUT":
        req.user = checkAuth(req, res);
        userController.updateUser(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url.match(/\/api\/users\/([a-zA-Z0-9]+)/)) {
    switch (req.method) {
      case "GET":
        userController.getUserById(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (
    req.url.match(
      /\/api\/users\?([\w-]+(=[\w.\-:%+]*)?(&[\w-]+(=[\w.\-:%+]*)?)*)?$/
    )
  ) {
    switch (req.method) {
      case "GET":
        userController.searchUser(req, res);
        break;
      case "PUT":
        let url = new URL(
          `${process.env.SERVER_DOMAIN}:${process.env.PORT || 5000}${req.url}`
        ).searchParams;
        req.user = checkAuth(req, res);

        switch (url.get("field")) {
          case "username":
            userController.updateUsername(req, res);
            break;
          case "displayName":
            userController.updateDisplayname(req, res);
            break;
          case "bio":
            userController.updateBio(req, res);
            break;
          default:
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Route not found" }));
            break;
        }
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url === "/api/login" && req.method === "POST") {
    userController.handleLogin(req, res);
  } else if (req.url === "/api/boards") {
    switch (req.method) {
      case "GET":
        req.user = checkAuth(req, res);
        boardController.getAllBoards(req, res);
        break;
      case "POST":
        req.user = checkAuth(req, res);
        boardController.createBoard(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url.match(/\/api\/boards\/([a-zA-Z0-9]+)/)) {
    switch (req.method) {
      case "GET":
        req.user = checkAuth(req, res);
        todoController.getAllTodos(req, res);
        break;
      case "POST":
        req.user = checkAuth(req, res);
        todoController.createTodo(req, res);
        break;
      case "DELETE":
        req.user = checkAuth(req, res);
        boardController.deleteBoard(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url.match(/\/api\/todos\/([a-zA-Z0-9]+)/)) {
    switch (req.method) {
      case "GET":
        taskController.getTaskByTodo(req, res);
        break;
      case "POST":
        req.user = checkAuth(req, res);
        taskController.createTask(req, res);
        break;
      case "DELETE":
        req.user = checkAuth(req, res);
        todoController.deleteTodo(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url === "/api/tasks" && req.method === "GET") {
    req.user = checkAuth(req, res);
    console.log(req.user);
    taskController.getAllTask(req, res);
  } else if (req.url.match(/\/api\/tasks\/([a-zA-Z0-9]+)/)) {
    switch (req.method) {
      case "GET":
        taskController.getTaskById(req, res);
        break;
      case "DELETE":
        taskController.deleteTask(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (
    req.url.match(
      /\/api\/tasks\?([\w-]+(=[\w.\-:%+]*)?(&[\w-]+(=[\w.\-:%+]*)?)*)?$/
    ) &&
    req.method === "PUT"
  ) {
    let url = new URL(
      `${process.env.SERVER_DOMAIN}:${process.env.PORT || 5000}${req.url}`
    ).searchParams;
    req.user = checkAuth(req, res);
    if (url.get("field") == "member") {
      taskController.addMember(req, res);
    } else if (url.get("field") == "deadline") {
      taskController.updateDeadline(req, res);
    } else if (url.get("field") == "title") {
      taskController.updateTitle(req, res);
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

module.exports = server;
