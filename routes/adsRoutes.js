import express from "express";
import { createAd, depositSatoshi, getAdsCreatedByMe, getPublisedAds, surfAds } from "../controllers/adsController.js";

const router = express.Router();

router.post("/createAds", createAd)
router.get("/getAllAds", getPublisedAds)
router.get("/getMyAds", getAdsCreatedByMe)
router.get("/surfAds/:id", surfAds)
router.get("/depositSatoshi/:id", depositSatoshi)

export default router;