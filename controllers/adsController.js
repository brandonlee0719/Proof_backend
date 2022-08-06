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
      rated
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
    const url_exists = await req.app.locals.db
      .collection("Ads")
      .findOne({ url });
    if (url_exists) {
      return res.status(400).json({
        error: `Please Ads with url ${url} already exists. You may want to update it`
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
        let isShown;
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

        return res.status(201).json({ ad });
      } else {
        return res.status(400).json({ error: "Verification failed!" });
      }
    } else {
      return res.status(404).json({ error: "Token not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
        const email = user.id.email;
        console.log(email);
        const db = req.app.locals.db;
        const ads = await db
          .collection("Ads")
          .find({ creatorEmail: email })
          .toArray();
        return res.status(200).json({ ads: ads });
      }
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const surfAds = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        error: "Please url is required"
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
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        let surferEmail = user.id.email;
        console.log(surferEmail);
        let db = req.app.locals.db;
        let surfer = await db
          .collection("user")
          .findOne({ email: surferEmail });
        console.log("the surfer", surfer);
        let ads = await db.collection("Ads").findOne({ url });
        console.log("the ads", ads);
        let adsCreatorEmail = ads.creatorEmail;
        let adsCreator = await db
          .collection("user")
          .findOne({ email: adsCreatorEmail });
        console.log("adsCreator", adsCreator);

        await db.collection("user").updateOne(
          { email: surferEmail },
          {
            $set: { surfingBalance: surfer.surfingBalance + ads.basePrice }
          }
        );

        await db.collection("user").updateOne(
          { email: adsCreatorEmail },
          {
            $set: {
              advertisingBalance: adsCreator.advertisingBalance - ads.basePrice
            }
          }
        );

        return res.status(200).json({
          message: `Ads with link: ${url} has been successfully surfed`
        });
      } else {
        return res.status(400).json({ error: "Verification failed!" });
      }
    } else {
      return res.status(404).json({ error: "Token not found" });
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const depositSatoshi = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        error: "Please amount is required"
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
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        let email = user.id.email;
        let db = req.app.locals.db;
        let userCollection = await db.collection("user").findOne({ email });
        console.log(userCollection)
        await db.collection("user").updateOne(
          { email },
          {
            $set: { advertisingBalance: userCollection.advertisingBalance + amount }
          }
        );
        
        return res.status(200).json({ message: `You advertising balance has been added ${amount} satoshi`})
      } else {
        return res.status(400).json({ error: "Verification failed!" });
      }
    } else {
      return res.status(404).json({ error: "Token not found" });
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

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

export { createAd, getAllAds, getAdsCreatedByMe, surfAds, depositSatoshi };
