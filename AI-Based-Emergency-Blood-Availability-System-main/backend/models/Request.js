import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, default: "" }
  },
  hospital: {
    type: String,
  },
  urgency: {
    type: String,
  },
  predictedPriority: {
    type: String,
  },
  unitsNeeded: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Completed"],
    default: "Pending",
  },
}, {
  timestamps: true,
});

const Request = mongoose.model("Request", requestSchema);
export default Request;
