import express from "express";
import cors from "cors";
import config from "./config/index.js";
import router from "./routes/index.js";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.use("/api", router);

app.listen(config.PORT, () =>
  console.log(`App listening on PORT ${config.PORT}`)
);
