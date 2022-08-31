import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

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
      isPublished = false,
      isPause = false,
      escrowAmount = 0
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
          isPause,
          escrowAmount,
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

const getAdById = async (req, res) => {
  try {
    const _id = req.params.id;
    const db = req.app.locals.db;
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
        const adsCollection = await db
          .collection("Ads")
          .findOne({ _id: ObjectId(_id) });

        if (email === adsCollection.creatorEmail) {
          return res.status(200).json({ ads: adsCollection });
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

const surfAds = async (req, res) => {
  try {
    const _id = req.params.id;
    const db = req.app.locals.db;
    const ads = await db.collection("Ads").findOne({ _id: ObjectId(_id) });

    if (!ads) {
      return res.status(400).json({
        error: `Ads with id ${_id} does not exist`
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
        let surfer = await db
          .collection("user")
          .findOne({ email: surferEmail });
        console.log("the surfer", surfer);

        let adsCreatorEmail = ads.creatorEmail;
        let adsCreator = await db
          .collection("user")
          .findOne({ email: adsCreatorEmail });
        console.log("adsCreator", adsCreator);

        // check if amount for advert is enough to sustain the surfing of the advert
        const amountForAdvert = ads.escrowAmount;
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

              db.collection("Ads").updateOne(
                { creatorEmail: adsCreatorEmail },
                {
                  $set: {
                    escrowAmount: `${ads.viewDuration === 60
                      ? Number(ads.escrowAmount) - Number(ads.basePrice) - 30
                      : ads.viewDuration === 40
                        ? Number(ads.escrowAmount) - Number(ads.basePrice) - 15
                        : ads.viewDuration === 30
                          ? Number(ads.escrowAmount) -
                            Number(ads.basePrice) -
                            10
                          : Number(ads.escrowAmount) - Number(ads.basePrice)}`
                  }
                }
              );

              const newAdsCollection = db
                .collection("Ads")
                .findOne({ creatorEmail: adsCreatorEmail });

              console.log("new ads collection", newAdsCollection);

              db.collection("user").updateOne(
                { email: adsCreatorEmail },
                {
                  $set: {
                    advertisingBalance: `${ads.viewDuration === 60
                      ? Number(ads.escrowAmount) - Number(ads.basePrice) - 30
                      : ads.viewDuration === 40
                        ? Number(ads.escrowAmount) - Number(ads.basePrice) - 15
                        : ads.viewDuration === 30
                          ? Number(ads.escrowAmount) -
                            Number(ads.basePrice) -
                            10
                          : Number(ads.escrowAmount) - Number(ads.basePrice)}`
                  }
                }
              );

              // check whether the advertiser still has enough satoshi for this advert
              const enoughSatoshi =
                newAdsCollection.escrowAmount >
                (newAdsCollection.viewDuration === 60
                  ? Number(newAdsCollection.basePrice) + 30
                  : newAdsCollection.viewDuration === 40
                    ? Number(newAdsCollection.basePrice) + 15
                    : newAdsCollection.viewDuration === 30
                      ? Number(newAdsCollection.basePrice) + 10
                      : Number(newAdsCollection.basePrice));

              console.log("enough satoshi", enoughSatoshi);

              if (enoughSatoshi) {
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

const updateAd = async (req, res) => {
  try {
    const _id = req.params.id;
    const db = req.app.locals.db;
    let ads_exists = await db.collection("Ads").findOne({ _id: ObjectId(_id) });
    console.log(ads_exists);

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

    const { authorization } = req.headers;
    const token = authorization
      ? authorization.split("Bearer ").length
        ? authorization.split("Bearer ")[1]
        : null
      : null;
    console.log(token);

    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      let email = user.id.email;
      if (user) {
        if (ads_exists) {
          // check if the user is the creator of the ads and then update ads
          if (email === ads_exists.creatorEmail) {
            await db.collection("Ads").updateOne(
              { _id: ObjectId(_id) },
              {
                $set: {
                  url: url ? url : ads_exists.url,
                  description: description
                    ? description
                    : ads_exists.description,
                  basePrice: basePrice ? basePrice : ads_exists.basePrice,
                  viewDuration: viewDuration
                    ? viewDuration
                    : ads_exists.viewDuration,
                  minRatingToViewAd: minRatingToViewAd
                    ? minRatingToViewAd
                    : ads_exists.minRatingToViewAd,
                  deviceToShowAd: deviceToShowAd
                    ? deviceToShowAd
                    : ads_exists.deviceToShowAd,
                  geoTargeting: geoTargeting
                    ? geoTargeting
                    : ads_exists.geoTargeting,
                  rated: rated ? rated : ads_exists.rated
                }
              }
            );
            return res.status(200).json({
              message: `Ads with advertisement ${ads_exists.url} has been successfully updated`
            });
          } else {
            return res.status(400).json({
              error: "You cannot edit this ads as you are not the owner"
            });
          }
        } else {
          return res
            .status(400)
            .json({ error: `Ads with id ${_id} does not exists` });
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

const updateAdStatus = async (req, res) => {
  try {
    const _id = req.params.id;
    const db = req.app.locals.db;
    let ads_exists = await db.collection("Ads").findOne({ _id: ObjectId(_id) });
    console.log(ads_exists);

    const isPause = ads_exists.isPause;

    const { authorization } = req.headers;
    const token = authorization
      ? authorization.split("Bearer ").length
        ? authorization.split("Bearer ")[1]
        : null
      : null;
    console.log(token);

    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      let email = user.id.email;
      if (user) {
        if (ads_exists) {
            await db.collection("Ads").updateOne(
              { _id: ObjectId(_id) },
              {
                $set: {
                  isPause: isPause ? false : true,
                  isPublished: isPause && ads_exists.escrowAmount ? true : false
                }
              }
            );
            return res.status(200).json({
              message: `ad status successfully updated`
            });
        } else {
          return res
            .status(400)
            .json({ error: `Ads with id ${_id} does not exists` });
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
}

const fundSatoshi = async (req, res) => {
  try {
    const _id = req.params.id;
    const amount = req.query.amount;
    const db = req.app.locals.db;
    const ads = await db.collection("Ads").findOne({ _id: ObjectId(_id) });

    if (!ads) {
      return res.status(400).json({
        error: `Ads with id ${_id} does not exist`
      });
    }
    // const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        error: "Please amount is required"
      });
    }
    if (amount < 100) {
      return res.status(400).json({
        error: "Please amount to be funded must be a minimum of 100 satoshi"
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
        let userCollection = await db.collection("user").findOne({ email });
        console.log("ads collection", userCollection);
        
        if(Number(userCollection.advertisingBalance) - Number(amount) < 0) {
          return res.status(401).json({error: "Your satoshi balance is less than the funded amount. Please top up your bill first."})
        } else {
          await db.collection("Ads").updateOne(
            { _id: ObjectId(_id) },
            {
              $set: {
                escrowAmount: Number(ads.escrowAmount) + Number(amount),
                isPublished: true
              }
            }
          );

          await db.collection("user").updateOne(
            { email },
            {
              $set: {
                advertisingBalance:
                  Number(userCollection.advertisingBalance) - Number(amount)
              }
            }
          );
  
          return res.status(201).json({
            message: `Amount of ${amount} Satoshi has been deducted from your Satoshi balance and added to your escrow amount`
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

const deleteAds = async (req, res) => {
  try {
    const _id = req.params.id;
    let db = req.app.locals.db;
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
        let userCollection = await db.collection("user").findOne({ email });
        // check if the user is the creator of the ads
        let ads = await db.collection("Ads").findOne({ _id: ObjectId(_id) });
        let adsEscrowAmount = ads.escrowAmount;
        if (ads.creatorEmail === email) {
          // user is the creator of the ads, execute delete operation
          let deletedAds = await db
            .collection("Ads")
            .deleteOne({ _id: ObjectId(_id) });
          if (deletedAds.deletedCount === 1) {
            // remove the escrowAmount from the advertising balance of the user
            await db.collection("user").updateOne(
              { email },
              {
                $set: {
                  advertisingBalance:
                    Number(userCollection.advertisingBalance) -
                    Number(adsEscrowAmount)
                }
              }
            );
            return res.status(201).json({
              message: `Ads with url ${ads.url} has been successfully deleted`
            });
          }
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

export {
  createAd,
  getPublisedAds,
  getAdsCreatedByMe,
  surfAds,
  fundSatoshi,
  deleteAds,
  updateAd,
  updateAdStatus,
  getAdById
};
