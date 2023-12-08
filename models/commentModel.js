const sql = require("mssql/msnodesqlv8");

class CommentModel {
  constructor(id_comments, content, id_user, id_task) {
    this.id_comments = id_comments;
    this.content = content;
    this.id_user = id_user;
    this.id_task = id_task;
  }

  findAll(pool) {
    return pool
      .request()
      .input("id_comments", sql.VarChar(10), this.id_comments)
      .query(`select * from comments where id_comments = @id_comments`);
  }

  findByTask(pool) {
    return pool
      .request()
      .input("id_task", sql.VarChar(10), this.id_task)
      .query(`select * from comments where id_task = @id_task`);
  }

  insert(pool) {
    return pool
      .request()
      .input("id_comments", sql.VarChar(10), this.id_comments)
      .input("content", sql.NVarChar(500), this.content)
      .input("id_user", sql.VarChar(10), this.id_user)
      .input("id_task", sql.VarChar(10), this.id_task)
      .query(`insert into comments (id_comments, content, id_user, id_task)
            valuse (@id_comments, @content, @id_user, @id_task)`);
  }

  deleteComment(pool) {
    return pool
      .request()
      .input("id_comments", sql.VarChar(10), this.id_comments)
      .query(`delete from comments where id_comments = @id_comments`);
  }
}
module.exports = CommentModel;
