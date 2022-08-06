import express from "express";
import { createAd, depositSatoshi, getAdsCreatedByMe, getAllAds, surfAds } from "../controllers/adsController.js";

const router = express.Router();

router.post("/createAds", createAd)
router.get("/getAllAds", getAllAds)
router.get("/getMyAds", getAdsCreatedByMe)
router.post("/surfAds", surfAds)
router.post("/depositSatoshi", depositSatoshi)

export default router;