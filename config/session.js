const session = require("cookie-session");

const sessionMiddleware = session({
  name: "github-session",
  secret: "github_secret_key",
  resave: false,
  saveUninitialized: false
});

module.exports = sessionMiddleware;