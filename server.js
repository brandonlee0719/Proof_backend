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
  const json = JSON.stringify({
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
    FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI,
    FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI,
    FIREBASE_AUTH_CERT_URL: process.env.FIREBASE_AUTH_CERT_URL,
    FIREBASE_CLIENT_CERT_URL: process.env.FIREBASE_CLIENT_CERT_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId,
  }, null, 2);
  res.send(json);
});
app.use("/api/user", router);

app.listen(config.PORT, () =>
  console.log(`App listening on PORT ${config.PORT}`)
);
