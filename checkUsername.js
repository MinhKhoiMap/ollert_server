const { connectDB } = require("./connectDB");

const UserModel = require("./models/userModel");

async function checkUsernameExisted(username) {
  let pool = await connectDB;

  let userObj = new UserModel();
  userObj.username = username;

  const listUsers = await userObj.findByUsername(pool);

  if (listUsers.recordset.length > 0) {
    return true;
  }
  return false;
}

module.exports = checkUsernameExisted;
