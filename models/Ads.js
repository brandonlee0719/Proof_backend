import mongoose from "mongoose";

const AdsSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    default: 4
  },
  viewDuration: [
    {
      type: String,
      required: true
    }
  ],
  minRatingToViewAd: [
    {
      type: String,
      required: true
    }
  ],
  deviceToShowAd: [
    {
      type: String,
      required: true
    }
  ],
  // countries the ad will be displayed
  geoTargeting: [
    {
        type: String,
        required: true
    }
  ],
  rated: {
    type: String,
    required: true
  },
  isShown: {
    type: Boolean,
    default: false
  },
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  //   ref: 'user'
  // }
}, {timestamps: true});

export default mongoose.model('Ads', AdsSchema)

