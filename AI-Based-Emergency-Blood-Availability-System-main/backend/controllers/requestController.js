import Request from "../models/Request.js";
import Donor from "../models/Donor.js";
import Match from "../models/Match.js";

export const createRequest = async (req, res) => {
  try {
    const { city, state, ...rest } = req.body;
    const newRequest = await Request.create({ 
      ...rest, 
      location: {
        city: city || "Unknown",
        state: state || ""
      },
      status: 'Pending' 
    });

    // Find matching donors for recommendations (but don't create matches)
    const matchingDonors = await Donor.find({ bloodGroup: newRequest.bloodGroup });

    // Return full payload expected by frontend
    return res.status(201).json({
      request: newRequest,
      recommendedDonors: matchingDonors.slice(0, 5),
      prediction: { priority: newRequest.urgency || "MEDIUM" },
      alerts: { critical: newRequest.urgency === 'Critical', message: "Urgent care needed." }
    });
  } catch (error) {
    console.error("Error in createRequest:", error);
    return res.status(500).json({ 
      message: "Failed to save request to database.", 
      error: error.message 
    });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Error in getRequests:", error);
    return res.status(500).json({ message: "Failed to load requests.", error: error.message });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }
    return res.status(200).json(request);
  } catch (error) {
    console.error("Error in updateRequest:", error);
    return res.status(500).json({ message: "Unable to update request.", error: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }
    return res.status(200).json({ message: "Request canceled." });
  } catch (error) {
    console.error("Error in deleteRequest:", error);
    return res.status(500).json({ message: "Failed to delete request.", error: error.message });
  }
};
