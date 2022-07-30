import jwt from "jsonwebtoken";
import Ads from "../models/Ads";
import jwt from "jsonwebtoken";

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
      isShown
    } = req.body;
    const token = token();
    if (token) {
      //verify with token
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        const adCreator = user.id;
        const userCollection = await req.app.locals.db.collction.findOne({
          adCreator
        });
        const userAdvertisingBalance = userCollection.advertisingBalance;
        isShown = userAdvertisingBalance >= basePrice ? true : false;
        const ad = await Ads.create({
          url,
          description,
          basePrice,
          viewDuration,
          minRatingToViewAd,
          deviceToShowAd,
          geoTargeting,
          rated,
          isShown,
          createdBy: adCreator
        });
        return res.status(201).json(ad);
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

const getAd = async (req, res) => {
  try {
    const _id = req.params.id
    const ad = await Ads.findOne({_id})
    const adAmount = ad.basePrice
    const adCreator = ad.createdBy
    const token = token();
    if (token) {
      //verify with token
      const user = jwt.verify(token, process.env.JWT_SECRET);
      const userId = user.id;
      const userCollection = await req.app.locals.db.collction.findOne({
        userId
      })
      userCollection.surfingBalance += adAmount
      userCollection.save()
      adCreator.advertisingBalance -= adAmount
      ad.save()

    }
  } catch (error) {}
};
