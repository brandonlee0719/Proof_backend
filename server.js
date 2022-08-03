import express from "express";
import cors from "cors";
import config from "./config/index.js";
import db from "./config/db.js";
import router from "./routes/userRoutes.js";

const app = express();

db(config.MONGO_URI, app);

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/', function(req, res, next) {
  res.send('<p>HTML Data</p>');
});
app.use("/api/user", router);

app.listen(config.PORT, () =>
  console.log(`App listening on PORT ${config.PORT}`)
);
