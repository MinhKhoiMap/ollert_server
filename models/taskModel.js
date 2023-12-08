const sql = require("mssql/msnodesqlv8");

class TaskModel {
  constructor(id_task, title, description, deadline, id_todo) {
    this.id_task = id_task;
    this.title = title;
    this.description = description;
    this.deadline = deadline;
    this.id_todo = id_todo;
  }

  findById(pool) {
    return pool
      .request()
      .input("id_task", sql.VarChar(10), this.id_task)
      .query(`select * from tasks where id_task = @id_task`);
  }

  findByTodoId(pool) {
    return pool
      .request()
      .input("id_todo", sql.VarChar(10), this.id_todo)
      .query(`select * from tasks where id_todos = @id_todo`);
  }

  findComments(pool) {
    return pool.request().input("id_task", sql.VarChar(10), this.id_task)
      .query(`select id_comments, content, id_user, display_name, tasks.id_task from tasks join 
    (select id_task, id_comments, content, comments.id_user, display_name from comments join users on comments.id_user = users.id_user) as temp on tasks.id_task = temp.id_task 
    where tasks.id_task = @id_task
    `);
  }

  findMembers(pool) {
    return pool.request().input("id_task", sql.VarChar(10), this.id_task)
      .query(`select temp.id_task, id_user, display_name from tasks join 
    (select id_task, members.id_user, username, password, display_name, bio from members 
    join users on members.id_user = users.id_user) as temp
    on tasks.id_task = temp.id_task 
    where tasks.id_task = @id_task`);
  }

  insert(pool) {
    return pool
      .request()
      .input("id_task", sql.VarChar(10), this.id_task)
      .input("title", sql.NVarChar(100), this.title)
      .input("description", sql.NVarChar(100), this.description)
      .input("deadline", sql.Date, this.deadline)
      .input("id_todos", sql.VarChar(10), this.id_todo)
      .query(`insert into tasks (id_task, title, description, deadline, id_todos) 
        values (@id_task, @title, @description, @deadline, @id_todos)`);
  }

  updateTitle(pool, newTitle) {
    return pool
      .request()
      .input("id_task", sql.VarChar(10), newTitle)
      .query(`update tasks set title = @title where id_task = @id_task`);
  }

  updateDescription(pool, newDescription) {
    return pool
      .request()
      .input("description", sql.NVarChar(100), newDescription)
      .query(
        `update tasks set description = @description where id_task = @id_task`
      );
  }

  updateDeadline(pool, newDeadline) {
    return pool
      .request()
      .input("deadline", sql.Date, newDeadline)
      .input("id_task", sql.VarChar(10), this.id_task)
      .query(`update tasks set deadline = @deadline where id_task = @id_task`);
  }

  deleteTask(pool) {
    return pool
      .request()
      .input("id_task", sql.VarChar(10), this.id_task)
      .query(`delete from tasks where id_task = @id_task`);
  }
}

module.exports = TaskModel;
