import express from "express";
import { createAd, depositSatoshi, getAdsCreatedByMe, getPublisedAds, surfAds } from "../controllers/adsController.js";

const router = express.Router();

router.post("/createAds", createAd)
router.get("/getAllAds", getPublisedAds)
router.get("/getMyAds", getAdsCreatedByMe)
router.post("/surfAds", surfAds)
router.post("/depositSatoshi", depositSatoshi)

export default router;