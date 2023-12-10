const sql = require("mssql/msnodesqlv8");
const ShortUniqueId = require("short-unique-id");

const { connectDB } = require("../connectDB");
const { parseBodyData } = require("../parseBodyData");

const TaskModel = require("../models/taskModel");
const CommentModel = require("../models/commentModel");
const MemberModel = require("../models/memberModel");

const uuid = new ShortUniqueId({ length: 10 });

async function getTaskByTodo(req, res) {
  let connect = await connectDB;
  let id_todo = req.url.split("/")[3];

  try {
    let taskModel = new TaskModel();
    taskModel.id_todo = id_todo;

    const taskRes = await taskModel.findByTodoId(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: taskRes.recordset }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function getAllTask(req, res) {
  let connect = await connectDB;
  try {
    let taskModel = new TaskModel();

    const taskListRes = await taskModel.findByUser(connect, req.user.id_user);

    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(
      JSON.stringify({
        data: taskListRes.recordset,
      })
    );
  } catch (error) {}
}

async function getTaskById(req, res) {
  let connect = await connectDB;
  let id_task = req.url.split("/")[3];

  try {
    let taskModel = new TaskModel(id_task);
    let memModel = new MemberModel(taskModel.id_task);
    let commentModel = new CommentModel();
    commentModel.id_task = taskModel.id_task;

    const taskRes = await taskModel.findById(connect);
    const memRes = await memModel.findByTask(connect);
    const commentRes = await commentModel.findByTask(connect);

    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(
      JSON.stringify({
        data: {
          ...taskRes.recordset[0],
          member: memRes.recordset,
          comments: commentRes.recordset,
        },
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function createTask(req, res) {
  let connect = await connectDB;

  try {
    let body = await parseBodyData(req);
    let id_todo = req.url.split("/")[3];

    let taskModel = new TaskModel(
      uuid.rnd(),
      body.title,
      body?.description,
      body?.deadline,
      id_todo
    );

    await taskModel.insert(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: taskModel }));
  } catch (error) {
    console.log(error);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function deleteTask(req, res) {
  let connect = await connectDB;
  let id_task = req.url.split("/")[3];

  try {
    const transaction = new sql.Transaction(connect);

    await transaction.begin();

    let taskModel = new TaskModel(id_task);
    // Delete members
    let memberModel = new MemberModel(taskModel.id_task);
    const memberRes = await memberModel.findByTask(transaction);
    for (let members of memberRes.recordset) {
      console.log(members, "this is members");
      let member = new MemberModel(members.id_member, members.id_user);
      await member.deleteMember(transaction);
    }
    // Delete comments
    let commentModel = new CommentModel();
    commentModel.id_task = taskModel.id_task;
    const commentRes = await commentModel.findByTask(transaction);
    for (let comments of commentRes.recordset) {
      console.log(comments, "this is comments");
      let comment = new CommentModel(comments.id_comments);
      await comment.deleteComment(transaction);
    }

    // Delete task
    const taskDelRes = await taskModel.deleteTask(transaction);

    if (taskDelRes.rowsAffected[0] < 1) {
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

async function addMember(req, res) {
  let connect = await connectDB;
  let id_task = req.url.split("/")[3];

  try {
    let body = await parseBodyData();
    let memberModel = new MemberModel(id_task, body.id_user);

    await memberModel.insert(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: memberModel }));
  } catch (error) {
    console.log(error);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function addComment(req, res) {
  let connect = await connectDB;
  let id_task = req.url.split("/")[3];

  try {
    let body = await parseBodyData(req);

    let commentModel = new CommentModel(
      uuid.rnd(),
      body.content,
      req.user.id_user,
      id_task
    );

    await commentModel.insert(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: commentModel }));
  } catch (error) {
    console.log(error);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function updateTitle(req, res) {
  let connect = await connectDB;
  let url = new URL(
    `${process.env.SERVER_DOMAIN}:${process.env.PORT || 5000}${req.url}`
  ).searchParams;
  let id_task = url.get("id_task");
  try {
    let body = await parseBodyData(req);
    let taskModel = new TaskModel(id_task);

    const taskUpRes = await taskModel.updateTitle(connect, body.title);
    if (taskUpRes.rowsAffected[0] < 1) {
      throw new Error("Task not found");
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Update deadline successfully",
      })
    );
  } catch (error) {
    console.log(error);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function updateDeadline(req, res) {
  let connect = await connectDB;
  let url = new URL(
    `${process.env.SERVER_DOMAIN}:${process.env.PORT || 5000}${req.url}`
  ).searchParams;
  let id_task = url.get("id_task");
  try {
    let body = await parseBodyData(req);
    let taskModel = new TaskModel(id_task);

    const taskUpRes = await taskModel.updateDeadline(connect, body.deadline);
    if (taskUpRes.rowsAffected[0] < 1) {
      throw new Error("Task not found");
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Update deadline successfully",
      })
    );
  } catch (error) {
    console.log(error);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

module.exports = {
  getTaskById,
  createTask,
  getTaskByTodo,
  deleteTask,
  addMember,
  addComment,
  updateDeadline,
  updateTitle,
  getAllTask,
};
