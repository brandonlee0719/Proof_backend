import jwt from "jsonwebtoken";
import Ads from "../models/Ads.js";

// create an ad
const createAd = async (req, res) => {
  try {
    const {
      url,
      description,
      basePrice,
      viewDuration,
      minRatingToViewAd,
      deviceToShowAd,
      geoTargeting,
      rated,
      isShown = false
    } = req.body;
    if (
      !url ||
      !description ||
      !basePrice ||
      !viewDuration ||
      !minRatingToViewAd ||
      !deviceToShowAd ||
      !geoTargeting ||
      !rated
    ) {
      return res.status(400).json({
        error:
          "Please url, description, basePice, viewDuration, minRatingToViewAd, deviceToShowAd, geoTargeting, rated fields are required"
      });
    }
    const { authorization } = req.headers;
    const token = authorization
      ? authorization.split("Bearer ").length
        ? authorization.split("Bearer ")[1]
        : null
      : null;
    console.log(token);
    if (token) {
      //verify with token
      const user = jwt.verify(token, process.env.JWT_SECRET);
      console.log("The user", user);
      if (user) {
        const adCreator = user.id.id;
        const email = user.id.email;
        const db = req.app.locals.db;
        const userCollection = await db.collection("user").findOne({
          email
        });
        const userAdvertisingBalance = userCollection.advertisingBalance;
        if (userAdvertisingBalance >= basePrice) {
          isShown = true;
        }
        const ad = await db.collection("Ads").insertOne({
          url,
          description,
          basePrice,
          viewDuration,
          minRatingToViewAd,
          deviceToShowAd,
          geoTargeting,
          rated,
          isShown,
          creatorEmail: email
        });

        // const adsData = {
        //   url: ad.url,
        //   description: ad.description,
        //   basePrice: ad.basePrice,
        //   viewDuration: ad.viewDuration.map((duration) => duration),
        //   minRatingToViewAd: ad.minRatingToViewAd.map((rating) => rating),
        //   deviceToShowAd: ad.deviceToShowAd.map((device) => device),
        //   geoTargeting: ad.geoTargeting.map((geotarget) => geotarget),
        //   rated: ad.rated,
        //   isShown: ad.isShown,
        //   creatorEmail: ad.creatorEmail
        // };
        return res.status(201).json({ad});
      } else {
        return res.status(400).json({ error: "Verification failed!" });
      }
    } else {
      return res.status(404).json({ error: "Token not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

const getAllAds = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const token = authorization
      ? authorization.split("Bearer ").length
        ? authorization.split("Bearer ")[1]
        : null
      : null;
    console.log(token);
    if (token) {
      //verify with token
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        const db = req.app.locals.db;
        const allAds = await db.collection("Ads").find({}).toArray();
        return res.status(200).json({ allAds });
      }
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
};

const getAdsCreatedByMe = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const token = authorization
      ? authorization.split("Bearer ").length
        ? authorization.split("Bearer ")[1]
        : null
      : null;
    console.log(token);
    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        const email = user.id.email
        console.log(email)
        const db = req.app.locals.db;
        const ads = await db.collection("Ads").find({ creatorEmail: email }).toArray()
        return res.status(200).json({ads: ads})
      }
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

function token() {
  const { authorization } = req.headers;
  const token = authorization
    ? authorization.split("Bearer ").length
      ? authorization.split("Bearer ")[1]
      : null
    : null;
  console.log(token);
  return token;
}

export { createAd, getAllAds, getAdsCreatedByMe };
