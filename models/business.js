const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BusinessSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    ownerClientUID: {
      type: String,
      required: true,
      index: true,
    },
    ownerEmail: {
      type: String,
      required: true,
      index: true,
    },
    businessID: String,
    firstName: String,
    lastName: String,
    businessName: String,
    address: String,
    city: String,
    state: String,
    email: String,
    businessPhone: String,
    category: String,
  },
  { timestamps: true }
);

BusinessSchema.index({ category: 1, city: 1, state: 1 });

module.exports = mongoose.model("business", BusinessSchema);
