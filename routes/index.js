import express from "express";
import {
  getProofByAddress,
  getAllProofs
} from "../controllers/index.js";

const router = express.Router();

router.post("/getProof", getProofByAddress);
router.get("/getAllProofs", getAllProofs);

export default router;
