const sql = require("mssql/msnodesqlv8");
const jwt = require("jsonwebtoken");
const ShortUniqueId = require("short-unique-id");

const { connectDB } = require("../connectDB");
const { parseBodyData } = require("../parseBodyData");
const checkUsernameExisted = require("../checkUsername");
const passCors = require("../cors");

const UserModel = require("../models/userModel");

const uuid = new ShortUniqueId({ length: 10 });

async function getUserById(req, res) {
  const url = new URL(
    `${process.env.SERVER_DOMAIN}:${process.env.PORT}${req.url}`
  );
  const id = url.pathname.split("/")[3];

  let connect = await connectDB;

  try {
    let userModel = new UserModel(id);
    const response = await userModel.findById(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: response }));
  } catch (error) {
    const err = JSON.parse(error.message) || error.message;
    res.writeHead(err.status || 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: err.message }));
  }
}

async function searchUser(req, res) {
  let url = new URL(
    `${process.env.SERVER_DOMAIN}:${process.env.PORT || 5000}${req.url}`
  ).searchParams;

  let connect = await connectDB;

  try {
    let userModel = new UserModel();
    userModel.username = url.get("username");
    const response = await userModel.findByUsername(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: response.recordset }));
  } catch (error) {
    res.writeHead(err.status || 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: err.message }));
  }
}

async function handleLogin(req, res) {
  let body = await parseBodyData(req);
  const { username, password } = body;

  let connect = await connectDB;

  try {
    let userModel = new UserModel();
    userModel.username = username;
    userModel.password = password;

    const accountResponse = await userModel.findByUsername(connect);
    if (accountResponse.recordset.length < 1)
      throw new Error(
        JSON.stringify({ message: "User not found", status: 404 })
      );

    let account = accountResponse.recordset[0];

    if (username === account.username && password === account.password) {
      const userToken = jwt.sign(
        { id_user: account.id_user, role: account.role },
        process.env.SECRET_KEY_TOKEN
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: account, token: userToken }));
    } else {
      throw new Error(
        JSON.stringify({ message: "Username or Password wrong", status: 401 })
      );
    }
  } catch (error) {
    const err = JSON.parse(error.message) || error.message;
    res.writeHead(err.status || 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: err.message }));
  }
}

async function createUser(req, res) {
  let connect = await connectDB;
  let body = await parseBodyData(req);
  let userModel = new UserModel(
    uuid.rnd(),
    body.username,
    body.password,
    body?.display_name,
    body?.bio
  );

  try {
    const isExisted = await checkUsernameExisted(userModel.username);
    if (isExisted) throw new Error("Username already exists");
    await userModel.insert(connect);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: userModel }));
  } catch (error) {
    const err = error.message;
    res.writeHead(err.status || 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: err }));
  }
}

async function updateUsername(req, res) {
  let connect = await connectDB;

  let newUsername = (await parseBodyData(req)).username;

  try {
    let userModel = new UserModel(req.user.id_user);

    await userModel.updateUsername(connect, newUsername);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Update username successfully" }));
  } catch (error) {
    // const err = JSON.parse(error.message) || error.message;
    res.writeHead(err.status || 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function updateDisplayname(req, res) {
  let connect = await connectDB;
  let newDisplayname = (await parseBodyData(req)).display_name;
  try {
    let userModel = new UserModel(req.user.id_user);

    await userModel.updateDisplayName(connect, newDisplayname);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Update display name successfully" }));
  } catch (error) {
    const err = JSON.parse(error.message) || error.message;
    res.writeHead(err.status || 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: err.message }));
  }
}

async function updateBio(req, res) {
  let connect = await connectDB;
  let newBio = (await parseBodyData(req)).bio;
  try {
    let userModel = new UserModel(req.user.id_user);

    await userModel.updateBio(connect, newBio);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Update bio successfully" }));
  } catch (error) {
    const err = JSON.parse(error.message) || error.message;
    res.writeHead(err.status || 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: err.message }));
  }
}

async function updateUser(req, res) {
  let connect = await connectDB;

  let body = await parseBodyData(req);
  let newUsername = body.username;
  let newDisplayname = body.displayname;
  let newBio = body.bio;

  try {
    let userModel = new UserModel(req.user.id_user);

    await userModel.updateUsername(connect, newUsername);
    await userModel.updateDisplayName(connect, newDisplayname);
    await userModel.updateBio(connect, newBio);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Update username successfully" }));
  } catch (error) {
    // const err = JSON.parse(error.message) || error.message;
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: error.message }));
  }
}

module.exports = {
  getUserById,
  searchUser,
  handleLogin,
  createUser,
  updateUsername,
  updateDisplayname,
  updateBio,
  updateUser,
};
