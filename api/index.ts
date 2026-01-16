import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routers/userRouter";
import postRouter from "./routers/postRouter";
import friendRouter from "./routers/friendRouter";
import shareRouter from "./routers/shareRouter";
import followRouter from "./routers/followRouter";
import profileRouter from "./routers/profileRouter";
import "dotenv/config";


const app = express();

app.use(function (req: Request, res: Response, next: NextFunction) {
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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send({ message: err.message });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
