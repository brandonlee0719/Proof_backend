import express from "express";
import {
  createAd,
  deleteAds,
  fundSatoshi,
  getAdsCreatedByMe,
  getAdById,
  getPublisedAds,
  surfAds,
  updateAd
} from "../controllers/adsController.js";

const router = express.Router();

router.post("/createAds", createAd);
router.get("/getAllAds", getPublisedAds);
router.get("/getMyAds", getAdsCreatedByMe);
router.get("/surfAds/:id", surfAds);
router.get("/fundSatoshi/:id", fundSatoshi);
router.delete("/deleteAds/:id", deleteAds);
router.put("/updateAds/:id", updateAd);
router.get("/getAdById/:id", getAdById);

export default router;
