const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const userRouter = require("./routers/userRouter.js");
const cors = require("cors");
const postRouter = require("./routers/postRouter.js");
const friendRouter = require("./routers/friendRouter.js");
const shareRouter = require("./routers/shareRouter.js");
const followRouter = require("./routers/followRouter.js");
const profileRouter = require("./routers/profileRouter.js");

const app = express();


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/friend", friendRouter);
app.use("/api/share", shareRouter);
app.use("/api/follow", followRouter);
app.use("/api/profile", profileRouter);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
