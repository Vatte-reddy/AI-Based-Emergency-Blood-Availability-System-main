import Donor from "../models/Donor.js";
import { predictDonorLikelihood } from "../utils/aiModel.js";

export const createDonor = async (req, res) => {
  try {
    const { city, state, Recency, Frequency, Monetary, Time, ...rest } = req.body;

    const r = Number(Recency || 0);
    const f = Number(Frequency || 1);
    const m = Number(Monetary || 250);
    const t = Number(Time || r);

    let prob;
    try {
      prob = await predictDonorLikelihood(r, f, m, t);
    } catch (predictionError) {
      console.error("[BACKEND] ML Model prediction failed, falling back to heuristic:", predictionError);
      // Fallback heuristic if Python bridge fails
      const logOdds = 0.5 + (-0.1 * r) + (0.05 * f) + (0.01 * t);
      prob = 1 / (1 + Math.exp(-logOdds));
    }

    const donor = new Donor({
      ...rest,
      Recency: r,
      Frequency: f,
      Monetary: m,
      Time: t,
      location: {
        city: city || "Unknown",
        state: state || ""
      },
      availability: false,
      responseProbability: prob
    });

    await donor.save();
    console.log(`[BACKEND] Donor registered with ML model: ${donor.name} (Likelihood: ${(prob * 100).toFixed(1)}%)`);
    return res.status(201).json({ success: true, donor, likelihood: prob });
  } catch (error) {
    console.error("Error in createDonor:", error);
    return res.status(500).json({ message: "Failed to register donor.", error: error.message });
  }
};

export const getDonors = async (req, res) => {
  try {
    const { bloodGroup, location, lat, lng } = req.query;
    let query = {};
    
    if (bloodGroup) {
      const normalizedBG = bloodGroup.trim().replace(/\+/g, '\\+');
      query.bloodGroup = { $regex: `^${normalizedBG}$`, $options: "i" };
    }

    if (location && !lat) {
      // REQUIREMENT: Strict dot-notation search for location.city
      query["location.city"] = { $regex: location.trim(), $options: "i" };
    }

    console.log(`[BACKEND] getDonors Query: ${JSON.stringify(query)}`);
    const donors = await Donor.find(query).sort({ createdAt: -1 });
    console.log(`[BACKEND] Found ${donors.length} donors.`);
    return res.status(200).json({ donors });
  } catch (error) {
    console.error("Error in getDonors:", error);
    return res.status(500).json({ message: "Failed to load donors.", error: error.message });
  }
};

export const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found." });
    }
    return res.status(200).json(donor);
  } catch (error) {
    console.error("Error in getDonorById:", error);
    return res.status(500).json({ message: "Failed to load donor.", error: error.message });
  }
};

export const updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!donor) {
      return res.status(404).json({ message: "Donor not found." });
    }
    return res.status(200).json(donor);
  } catch (error) {
    console.error("Error in updateDonor:", error);
    return res.status(500).json({ message: "Unable to update donor.", error: error.message });
  }
};

export const matchDonors = async (req, res) => {
  try {
    const { bloodGroup, location, lat, lng } = req.query;
    if (!bloodGroup) {
      return res.status(400).json({ message: "Blood group is required." });
    }

    let query = { availability: true };

    const normalizedBG = bloodGroup.trim().replace(/\+/g, '\\+');
    query.bloodGroup = { $regex: `^${normalizedBG}$`, $options: "i" };

    if (location && !lat) {
      // REQUIREMENT: Strict dot-notation search for location.city
      query["location.city"] = { $regex: location.trim(), $options: "i" };
    }

    console.log(`[BACKEND] matchDonors Query: ${JSON.stringify(query)}`);
    const donors = await Donor.find(query).sort({ createdAt: -1 });
    console.log(`[BACKEND] Matched ${donors.length} donors.`);
    return res.status(200).json({ donors });
  } catch (error) {
    console.error("Error in matchDonors:", error);
    return res.status(500).json({ message: "Failed to find matching donors.", error: error.message });
  }
};

export const deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found." });
    }
    return res.status(200).json({ message: "Donor removed." });
  } catch (error) {
    console.error("Error in deleteDonor:", error);
    return res.status(500).json({ message: "Failed to delete donor.", error: error.message });
  }
};
