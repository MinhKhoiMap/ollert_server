const sql = require("mssql/msnodesqlv8");
const ShortUniqueId = require("short-unique-id");

const { connectDB } = require("../connectDB");
const { parseBodyData } = require("../parseBodyData");

const TodoModel = require("../models/todoModel");
const TaskModel = require("../models/taskModel");
const CommentModel = require("../models/commentModel");
const MemberModel = require("../models/memberModel");

const uuid = new ShortUniqueId({ length: 10 });

async function getAllTodos(req, res) {
  let connect = await connectDB;
  let id_board = req.url.split("/")[3];

  try {
    let todoModel = new TodoModel();
    todoModel.id_board = id_board;

    const todoRes = await todoModel.findByIdBoard(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: todoRes.recordset }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function createTodo(req, res) {
  let connect = await connectDB;
  let id_board = req.url.split("/")[3];

  try {
    let body = await parseBodyData(req);

    let todoModel = new TodoModel(uuid.rnd(), body.todo_name, id_board);
    await todoModel.insert(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: todoModel }));
  } catch (error) {
    console.log(error);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function deleteTodo(req, res) {
  let connect = await connectDB;
  let id_todo = req.url.split("/")[3];

  try {
    const transaction = new sql.Transaction(connect);

    await transaction.begin();
    let todoModel = new TodoModel(id_todo);

    let taskModel = new TaskModel();
    taskModel.id_todo = todoModel.id_todo;
    const taskRes = await taskModel.findByTodoId(transaction);
    for (let tasks of taskRes.recordset) {
      console.log(tasks, "this is task");
      // Delete member
      let memberModel = new MemberModel(tasks.id_task);
      const memberRes = await memberModel.findByTask(transaction);
      for (let members of memberRes.recordset) {
        console.log(members, "this is members");
        let member = new MemberModel(members.id_member, members.id_user);
        await member.deleteMember(transaction);
      }
      // Delete comments
      let commentModel = new CommentModel();
      commentModel.id_task = tasks.id_task;
      const commentRes = await commentModel.findByTask(transaction);
      for (let comments of commentRes.recordset) {
        console.log(comments, "this is comments");
        let comment = new CommentModel(comments.id_comments);
        await comment.deleteComment(transaction);
      }

      // Delete task
      let task = new TaskModel(tasks.id_task);
      await task.deleteTask(transaction);
    }

    const todoDelRes = await todoModel.deleteTodo(transaction);

    if (todoDelRes.rowsAffected[0] < 1) {
      throw new Error("Board not found");
    }

    await transaction.commit();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "deleted successfully" }));
  } catch (error) {}
}

module.exports = {
  getAllTodos,
  createTodo,
  deleteTodo,
};
