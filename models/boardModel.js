const sql = require("mssql/msnodesqlv8");

class BoardModel {
  constructor(id_board, board_name, id_user) {
    this.id_board = id_board;
    this.board_name = board_name;
    this.id_user = id_user;
  }

  findAll(pool) {
    // return pool.request().input("id_user", sql.VarChar(10), this.id_user)
    //   .query(`select *  from boards join
    //   (select id_todo, todo_name, id_board, id_task, title, description, deadline
    //     from todos left join tasks on todos.id_todo = tasks.id_todos) as temp
    //     on boards.id_board = temp.id_board
    //     where boards.id_user = @id_user
    // `);
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(`select * from boards where id_user = @id_user`);
  }

  insert(pool) {
    return pool
      .request()
      .input("id_board", sql.VarChar(10), this.id_board)
      .input("board_name", sql.NVarChar(200), this.board_name)
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(`insert into boards (id_board, board_name, id_user)
            values (@id_board, @board_name, @id_user)`);
  }

  deleteBoard(pool) {
    return pool
      .request()
      .input("id_board", sql.VarChar(10), this.id_board)
      .query(`delete from boards where id_board = @id_board`);
  }
}

module.exports = BoardModel;
