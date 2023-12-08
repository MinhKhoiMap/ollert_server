const jwt = require("jsonwebtoken");
const passCors = require("./cors");

function checkAuth(req, res) {
  const token = req.headers["authorization"];
  try {
    const tokenDecode = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
    return tokenDecode;
  } catch (error) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User is not authorized" }));
  }
}

module.exports = checkAuth;
