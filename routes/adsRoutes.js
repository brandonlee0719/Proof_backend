import express from "express";
import { createAd, getAdsCreatedByMe, getAllAds, surfAds } from "../controllers/adsController.js";

const router = express.Router();

router.post("/createAds", createAd)
router.get("/getAllAds", getAllAds)
router.get("/getMyAds", getAdsCreatedByMe)
router.post("/surfAds", surfAds)

export default router;