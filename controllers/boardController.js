const sql = require("mssql/msnodesqlv8");
const ShortUniqueId = require("short-unique-id");

const { connectDB } = require("../connectDB");
const { parseBodyData } = require("../parseBodyData");
const passCors = require("../cors");

const BoardModel = require("../models/boardModel");
const TodoModel = require("../models/todoModel");
const TaskModel = require("../models/taskModel");
const CommentModel = require("../models/commentModel");
const MemberModel = require("../models/memberModel");

const uuid = new ShortUniqueId({ length: 10 });

async function getAllBoards(req, res) {
  let connect = await connectDB;
  try {
    let boardModel = new BoardModel();
    boardModel.id_user = req.user.id_user;
    // boardModel.id_user = "Q7JSJgGjI5";

    const response = await boardModel.findAll(connect);

    for (let i = 0; i < response.recordset.length; i++) {
      let id_board = response.recordset[i].id_board;
      let todoModel = new TodoModel();
      todoModel.id_board = id_board;
      const todoRes = await todoModel.findByIdBoard(connect);
      response.recordset[i].todos = todoRes.recordset;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: response.recordset }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function deleteBoard(req, res) {
  let connect = await connectDB;
  let id = req.url.split("/")[3];

  try {
    let boardModel = new BoardModel(id);

    const transaction = new sql.Transaction(connect);

    await transaction.begin();
    let todoModel = new TodoModel();
    todoModel.id_board = boardModel.id_board;

    const todoRes = await todoModel.findByIdBoard(transaction);
    for (let todo of todoRes.recordset) {
      // console.log(todo, "this is todo");
      let taskModel = new TaskModel();
      taskModel.id_todo = todo.id_todo;
      const taskRes = await taskModel.findByTodoId(transaction);
      for (let tasks of taskRes.recordset) {
        // console.log(tasks, "this is task");
        // Delete member
        let memberModel = new MemberModel(tasks.id_task);
        const memberRes = await memberModel.findByTask(transaction);
        for (let members of memberRes.recordset) {
          // console.log(members, "this is members");
          let member = new MemberModel(members.id_member, members.id_user);
          await member.deleteMember(transaction);
        }
        // Delete comments
        let commentModel = new CommentModel();
        commentModel.id_task = tasks.id_task;
        const commentRes = await commentModel.findByTask(transaction);
        for (let comments of commentRes.recordset) {
          // console.log(comments, "this is comments");
          let comment = new CommentModel(comments.id_comments);
          await comment.deleteComment(transaction);
        }

        // Delete task
        let task = new TaskModel(tasks.id_task);
        await task.deleteTask(transaction);
      }

      let todoOject = new TodoModel(todo.id_todo);
      await todoOject.deleteTodo(transaction);
    }

    const boardDelRes = await boardModel.deleteBoard(transaction);
    if (boardDelRes.rowsAffected[0] < 1) {
      throw new Error("Board not found");
    }

    await transaction.commit();
    
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "deleted successfully" }));
  } catch (error) {
    console.log(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function createBoard(req, res) {
  let connect = await connectDB;

  try {
    let body = await parseBodyData(req);

    let boardModel = new BoardModel(
      uuid.rnd(),
      body.board_name,
      req.user.id_user
    );

    await boardModel.insert(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: boardModel }));
  } catch (error) {
    console.log(error);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

module.exports = {
  getAllBoards,
  deleteBoard,
  createBoard,
};
