const sql = require("mssql/msnodesqlv8");

class TodoModel {
  constructor(id_todo, todo_name, id_board) {
    this.id_todo = id_todo;
    this.todo_name = todo_name;
    this.id_board = id_board;
  }

  findByIdBoard(pool) {
    return pool
      .request()
      .input("id_board", sql.VarChar(10), this.id_board)
      .query(`select * from todos where id_board = @id_board`);
  }

  findById(pool) {
    return pool
      .request()
      .input("id_todo", sql.VarChar(10), this.id_todo)
      .query(`select * from todos where id_todo = @id_todo`);
  }

  updateName(pool, newName) {
    return pool
      .request()
      .input("todo_name", sql.NVarChar(200), newName)
      .query(`update todos set todo_name = @todo_name`);
  }

  deleteTodo(pool) {
    return pool
      .request()
      .input("id_todo", sql.VarChar(10), this.id_todo)
      .query(`delete from todos where id_todo = @id_todo`);
  }

  insert(pool) {
    return pool
      .request()
      .input("id_todo", sql.VarChar(10), this.id_todo)
      .input("todo_name", sql.NVarChar(200), this.todo_name)
      .input("id_board", sql.VarChar(10), this.id_board)
      .query(`insert into todos (id_todo, todo_name, id_board)
              values (@id_todo, @todo_name, @id_board)`);
  }
}

module.exports = TodoModel;
