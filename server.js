import express from "express";
import cors from "cors";
import config from "./config/index.js";
import db from "./config/db.js";
import router from "./routes/userRoutes.js";
import adRouter from "./routes/adsRoutes.js"

const app = express();

db(config.MONGO_URI, app);

app.use(cors({ origin: false }));
app.use(express.json());

app.use("/api/user", router);
app.use("/api/ads", adRouter)

app.listen(config.PORT, () =>
  console.log(`App listening on PORT ${config.PORT}`)
);
