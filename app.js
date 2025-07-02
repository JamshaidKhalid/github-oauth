const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");

const connectDB = require("./config/connectDB");

require("./config/passport");

const app = express();
dotenv.config();

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));


app.use("/", require("./routes/github.route"));

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
