import express from "express";
import {
  getTokenPrice
} from "../controllers/index.js";

const router = express.Router();

router.get("/token/:id", getTokenPrice);

export default router;
