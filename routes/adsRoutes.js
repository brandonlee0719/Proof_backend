import express from "express";
import { createAd, getAdsCreatedByMe, getAllAds } from "../controllers/adsController.js";

const router = express.Router();

router.post("/createAds", createAd)
router.get("/getAllAds", getAllAds)
router.get("/getMyAds", getAdsCreatedByMe)

export default router;