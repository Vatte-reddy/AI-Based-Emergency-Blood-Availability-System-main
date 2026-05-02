import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, default: "" }
  },
  phone: { type: String },
  age: { type: Number },
  gender: { type: String },
  medicalHistory: { type: String },
  availability: { type: Boolean, default: false },
  Recency: { type: Number },
  Frequency: { type: Number },
  Monetary: { type: Number },
  Time: { type: Number },
  distanceKm: { type: Number },
  responseProbability: { type: Number },
}, {
  timestamps: true,
});

const Donor = mongoose.model("Donor", donorSchema);
export default Donor;