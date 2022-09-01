import express from "express";
import {
  createAd,
  deleteAds,
  fundSatoshi,
  getAdsCreatedByMe,
  getAdById,
  getSurfAdById,
  getPublisedAds,
  surfAds,
  updateAd,
  updateAdStatus
} from "../controllers/adsController.js";

const router = express.Router();

router.post("/createAds", createAd);
router.get("/getAllAds", getPublisedAds);
router.get("/getMyAds", getAdsCreatedByMe);
router.get("/surfAds/:id", surfAds);
router.get("/fundSatoshi/:id", fundSatoshi);
router.delete("/deleteAds/:id", deleteAds);
router.put("/updateAds/:id", updateAd);
router.put("/updateAdStatus/:id", updateAdStatus);
router.get("/getAdById/:id", getAdById);
router.get("/getSurfAdById/:id", getSurfAdById);

export default router;
