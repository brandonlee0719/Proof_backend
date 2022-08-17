import express from "express";
import {
  createAd,
  deleteAds,
  depositSatoshi,
  getAdsCreatedByMe,
  getASingleAdsCreatedByMe,
  getPublisedAds,
  surfAds,
  updateAd
} from "../controllers/adsController.js";

const router = express.Router();

router.post("/createAds", createAd);
router.get("/getAllAds", getPublisedAds);
router.get("/getMyAds", getAdsCreatedByMe);
router.get("/surfAds/:id", surfAds);
router.get("/depositSatoshi/:id", depositSatoshi);
router.delete("/deleteAds/:id", deleteAds);
router.put("/updateAds/:id", updateAd);
router.get("/getASingleAdsCreatedByMe/:id", getASingleAdsCreatedByMe);

export default router;
