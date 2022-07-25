import express from "express";
import cors from "cors";
import config from "./config/index.js";
import db from "./config/db.js";
import userRouter from "./api/user.js";

const app = express();

db(config.MONGO_URI, app);

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/api/user", userRouter);

app.listen(config.PORT, () =>
  console.log(`App listening on PORT ${config.PORT}`)
);
