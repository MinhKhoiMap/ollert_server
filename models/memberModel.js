const sql = require("mssql/msnodesqlv8");

class MemberModel {
  constructor(id_task, id_user) {
    this.id_task = id_task;
    this.id_user = id_user;
  }

  findByTask(pool) {
    return pool
      .request()
      .input("id_task", sql.VarChar(10), this.id_task)
      .query(`select * from members join users on users.id_user = members.id_user where id_task = @id_task`);
  }

  findByUser(pool) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(
        `select * from members where id_user = @id_user`
      );
  }

  insert(pool) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .input("id_task", sql.VarChar(10), this.id_task)
      .query(`insert into members (id_user, id_task)
            values (@id_user, @id_task)`);
  }

  deleteMember(pool) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .input("id_task", sql.VarChar(10), this.id_task)
      .query(
        `delete from members where id_user = @id_user or id_task = @id_task`
      );
  }
}

module.exports = MemberModel;
