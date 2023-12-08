const sql = require("mssql/msnodesqlv8");

class UserModel {
  constructor(id_user, username, password, display_name, bio) {
    this.id_user = id_user;
    this.username = username;
    this.password = password;
    this.display_name = display_name;
    this.bio = bio;
  }

  findAll(pool) {
    return pool.request().query(`select * from users`);
  }

  findById(pool) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(`select * from users where id_user = @id_user`);
  }

  findByUsername(pool) {
    return pool
      .request()
      .input("username", sql.VarChar(200), this.username)
      .query(`select * from users where username = @username`);
  }

  insert(pool) {
    if (this.id_user && this.username && this.password) {
      return pool
        .request()
        .input("id_user", sql.VarChar(10), this.id_user)
        .input("username", sql.VarChar(10), this.username)
        .input("password", sql.VarChar(10), this.password)
        .input("display_name", sql.VarChar(10), this.display_name)
        .query(
          `insert into users (id_user, username, password, display_name) 
        values (@id_user, @username, @password, @display_name)`
        );
    } else {
      throw new Error(
        JSON.stringify({ message: "Invalid document", status: 400 })
      );
    }
  }

  updateUsername(pool, newUsername) {
    return pool
      .request()
      .input("username", sql.VarChar(200), newUsername)
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(`update users set username = @username where id_user = @id_user`);
  }

  updatePassword(pool, newPassword) {
    return pool
      .request()
      .input("password", sql.VarChar(50), newPassword)
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(`update users set password = @password where id_user = @id_user`);
  }

  updateDisplayName(pool, newDisplayName) {
    return pool
      .request()
      .input("display_name", sql.NVarChar(200), newDisplayName)
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(
        `update users set display_name = @display_name where id_user = @id_user`
      );
  }

  updateBio(pool, newBio) {
    return pool
      .request()
      .input("bio", sql.NVarChar(300), newBio)
      .query(`update users set bio = @bio where id_user = @id_user`);
  }
}

module.exports = UserModel;
