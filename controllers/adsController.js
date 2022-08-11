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
      isPublished = false
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
        const email = user.id.email;
        const db = req.app.locals.db;

        const ad = await db.collection("Ads").insertOne({
          url,
          description,
          basePrice,
          viewDuration,
          minRatingToViewAd,
          deviceToShowAd,
          geoTargeting,
          rated,
          isPublished,
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

const getPublisedAds = async (req, res) => {
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
        const allAds = await db
          .collection("Ads")
          .find({ isPublished: true })
          .toArray();
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

        const adsCreatorName = adsCreator.name;
        const escrowCollection = await db
          .collection("Escrow")
          .findOne({ nameOfUser: adsCreatorName });
        const amountForAdvert = escrowCollection.amountForUrlAdvert;
        const nameofAdvertiser = escrowCollection.nameOfUser;
        console.log("amount for advert", amountForAdvert);

        // check if amount for advert is enough to sustain the surfing of the advert
        const isGreater =
          amountForAdvert >
          (ads.viewDuration === 60
            ? Number(ads.basePrice) + 30
            : ads.viewDuration === 40
              ? Number(ads.basePrice) + 15
              : ads.viewDuration === 30
                ? Number(ads.basePrice) + 10
                : Number(ads.basePrice));

        console.log("is greater", isGreater);

        if (isGreater) {
          var currentDate = new Date();
          var timeToSurf = currentDate.setSeconds(
            currentDate.getSeconds() + ads.viewDuration
          );
          var deadline = new Date(timeToSurf).getTime();

          var x = setInterval(function() {
            var now = new Date().getTime();
            var t = deadline - now;
            var seconds = Math.floor(t % (1000 * 60) / 1000);
            console.log(`${seconds}s`);
            if (t < 0) {
              clearInterval(x);
              console.log("time elapsed");
              db.collection("user").updateOne(
                { email: surferEmail },
                {
                  $set: {
                    surfingBalance: `${ads.viewDuration === 60
                      ? Number(surfer.surfingBalance) +
                        Number(ads.basePrice) +
                        30
                      : ads.viewDuration === 40
                        ? Number(surfer.surfingBalance) +
                          Number(ads.basePrice) +
                          15
                        : ads.viewDuration === 30
                          ? Number(surfer.surfingBalance) +
                            Number(ads.basePrice) +
                            10
                          : Number(surfer.surfingBalance) +
                            Number(ads.basePrice)}`
                  }
                }
              );

              db.collection("Escrow").updateOne(
                { nameOfUser: nameofAdvertiser },
                {
                  $set: {
                    amountForUrlAdvert: `${ads.viewDuration === 60
                      ? Number(escrowCollection.amountForUrlAdvert) -
                        Number(ads.basePrice) -
                        30
                      : ads.viewDuration === 40
                        ? Number(escrowCollection.amountForUrlAdvert) -
                          Number(ads.basePrice) -
                          15
                        : ads.viewDuration === 30
                          ? Number(escrowCollection.amountForUrlAdvert) -
                            Number(ads.basePrice) -
                            10
                          : Number(escrowCollection.amountForUrlAdvert) -
                            Number(ads.basePrice)}`
                  }
                }
              );

              const newEscrowCollection = db
                .collection("Escrow")
                .findOne({ nameOfUser: adsCreatorName });
              const newAmountForUrlAdvert = newEscrowCollection.amountForUrlAdvert;

              // check whether the advertiser still has enough satoshi for this advert
              const enoughSatoshi =
                newAmountForUrlAdvert >
                (ads.viewDuration === 60
                  ? Number(ads.basePrice) + 30
                  : ads.viewDuration === 40
                    ? Number(ads.basePrice) + 15
                    : ads.viewDuration === 30
                      ? Number(ads.basePrice) + 10
                      : Number(ads.basePrice));

              if (enoughSatoshi === false) {
                db.collection("Ads").updateOne(
                  { creatorEmail: adsCreatorEmail },
                  {
                    $set: {
                      isPublished: false
                    }
                  }
                );
              }

              return res.status(200).json({
                message: `You have earned ${ads.viewDuration === 60
                  ? ads.basePrice + 30
                  : ads.viewDuration === 40
                    ? ads.basePrice + 15
                    : ads.viewDuration === 30
                      ? ads.basePrice + 10
                      : ads.basePrice} satoshi`
              });
            }
          }, 1000);
        } else {
          return res.status(400).json({
            error: "You cannot surf this add as you don't have enough satoshi"
          });
        }
      } else {
        return res.status(400).json({ error: "Verification failed!" });
      }
    } else {
      return res.status(404).json({ error: "Token not found" });
    }
  } catch (error) {
    const message = error.toString();
    return res.status(400).json({ error: message });
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
    if (amount < 100) {
      return res.status(400).json({
        error: "Please amount to be deposited must be a minimum of 100 satoshi"
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
        let name = user.id.name;
        let email = user.id.email;
        let db = req.app.locals.db;
        let adsCollection = await db
          .collection("Ads")
          .findOne({ creatorEmail: email });
        console.log("the ads collection", adsCollection);
        let adsUrl = adsCollection.url;

        const escrow = await db.collection("Escrow").insertOne({
          nameOfUser: name,
          adsUrl,
          amountForUrlAdvert: amount
        });
        console.log("the escrow", escrow);

        const escrowCollection = await db
          .collection("Escrow")
          .findOne({ nameOfUser: name });
        const amountFromEscrow = escrowCollection.amountForUrlAdvert;
        console.log("amount from escrow", amountFromEscrow);

        if (amountFromEscrow > 100) {
          await db.collection("Ads").updateOne(
            { creatorEmail: email },
            {
              $set: {
                isPublished: true
              }
            }
          );

          return res.status(201).json({
            message: `Amount of ${amount} Satoshi has been deducted from your Satoshi balance and moved into your Escrow for surfing your advert with url: ${adsUrl}`
          });
        }
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

export { createAd, getPublisedAds, getAdsCreatedByMe, surfAds, depositSatoshi };
