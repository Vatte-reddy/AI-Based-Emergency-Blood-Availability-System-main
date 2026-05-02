import express from 'express';
import Match from '../models/Match.js';
import Donor from '../models/Donor.js';
import Request from '../models/Request.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

// 1. Request Connection
router.post('/match-request', async (req, res) => {
  try {
    const { donorId, requestId } = req.body;

    if (!donorId || !requestId) {
      return res.status(400).json({ message: "donorId and requestId are required" });
    }

    // Check if match already exists
    const existingMatch = await Match.findOne({ donorId, requestId });
    if (existingMatch) {
      return res.status(400).json({ message: "A connection request already exists for this match" });
    }

    // Verify donor & request exist
    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    const patientRequest = await Request.findById(requestId);
    if (!patientRequest) return res.status(404).json({ message: "Patient Request not found" });

    // Create match
    const newMatch = await Match.create({
      donorId,
      requestId,
      status: "pending"
    });

    // Send email to donor
    if (donor.email) {
      let city = "Unknown";
      let state = "";

      const loc = patientRequest.location;
      if (loc) {
        if (typeof loc === 'object') {
          city = loc.city || "Unknown";
          state = loc.state || "";
        } else if (typeof loc === 'string') {
          // Handle legacy string format "City, State"
          const parts = loc.split(",");
          city = parts[0]?.trim() || "Unknown";
          state = parts[1]?.trim() || "";
        }
      }

      const locationFull = state ? `${city}, ${state}, India` : `${city}, India`;

      const requesterName = patientRequest.patientName || "A requester";
      const requesterEmail = patientRequest.email || patientRequest.createdBy || "No email provided";

      console.log("Requester Email:", requesterEmail);

      const htmlContent = `
        <p>Hello ${donor.name},</p>
        <p>We hope you're doing well.</p>
        <p>An urgent blood request has been raised on BloodHub that matches your blood group.</p>
        <p>🔴 <strong>Blood Group Required:</strong> ${patientRequest.bloodGroup}<br>
        📍 <strong>Location:</strong> ${locationFull}<br>
        ⚠️ <strong>Urgency Level:</strong> ${patientRequest.urgency || 'Normal'}</p>
        <p>👤 <strong>Requester Details:</strong><br>
        Name: ${requesterName}<br>
        Email: ${requesterEmail}</p>
        <p>If you are available to help, please reach out to the requester directly via email at the address provided above.</p>
        <p>Your support at this moment could help save a life.</p>
        <p>Thank you for being a part of BloodHub.</p>
        <p>Warm regards,<br>
        <strong>Team BloodHub</strong></p>
      `;

      const textContent = `Hello ${donor.name},\n\nWe hope you're doing well.\n\nAn urgent blood request has been raised on BloodHub that matches your blood group.\n\n🔴 Blood Group Required: ${patientRequest.bloodGroup}\n📍 Location: ${locationFull}\n⚠️ Urgency Level: ${patientRequest.urgency || 'Normal'}\n\n👤 Requester Details:\nName: ${requesterName}\nEmail: ${requesterEmail}\n\nIf you are available to help, please reach out to the requester directly via email at the address provided above.\n\nYour support at this moment could help save a life.\n\nThank you for being a part of BloodHub.\n\nWarm regards,\nTeam BloodHub`;

      try {
        console.log(`[Email Triggered] For donor: ${donor.email}`);
        const sent = await sendEmail(
          donor.email,
          "Blood Request Alert",
          textContent,
          htmlContent
        );
        if (sent) {
          console.log(`[Email Sent Success] To: ${donor.email}`);
        } else {
          console.warn(`[Email Warning] Email not sent but request processed for: ${donor.email}`);
        }
      } catch (emailErr) {
        console.error("[MatchRoute] Email dispatch failed but request was saved:", emailErr.message);
      }
    }

    res.status(201).json({ message: "Connection request sent successfully", match: newMatch });
  } catch (error) {
    console.error("Error creating match request:", error);
    res.status(500).json({ message: "Failed to create match request" });
  }
});

// 2. Donor Response
router.post('/match-response', async (req, res) => {
  try {
    const { matchId, status } = req.body;

    if (!matchId || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Valid matchId and status ('accepted' or 'rejected') required" });
    }

    const match = await Match.findById(matchId).populate('donorId').populate('requestId');
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Update status
    match.status = status;
    await match.save();

    const patientEmail = match.requestId?.createdBy;
    const donorName = match.donorId?.name || "A donor";

    // Need to send email to patient
    if (patientEmail && patientEmail !== 'anonymous') {
      let emailText = `Your blood request has been ${status} by the donor.\n\n`;
      if (status === 'accepted') {
         emailText += `Great news! The donor has accepted your request. Please log in to BloodHub immediately to view their contact information (Phone & Email).\n\n`;
      }
      emailText += `Thank you,\nBloodHub Team`;

      console.log(`[Email Triggered] Status update for patient: ${patientEmail}`);
      await sendEmail(
        patientEmail,
        "Blood Request Update",
        emailText
      );
    }

    res.json({ message: `Match status updated to ${status}`, match });
  } catch (error) {
    console.error("Error updating match response:", error);
    res.status(500).json({ message: "Failed to update match response" });
  }
});

// 3. Status + Contact API (Polling endpoint for Patient side)
router.get('/match/request/:requestId', async (req, res) => {
  try {
    const matches = await Match.find({ requestId: req.params.requestId }).populate('donorId', 'name phone email bloodGroup location');
    if (!matches || matches.length === 0) return res.json([]);

    const safeMatches = matches.map(match => {
      let donor = match.donorId ? match.donorId.toObject() : null;
      if (donor && match.status !== 'accepted') {
        delete donor.phone;
        delete donor.email;
        donor.hiddenMessage = "Hidden until donor accepts";
      }
      return { 
        matchId: match._id,
        status: match.status,
        donor: donor 
      };
    });

    res.json(safeMatches);
  } catch (error) {
    console.error("Error fetching match by requestId:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 4. Dedicated Donor Inbox Endpoint
router.get('/matches/donor/:donorId', async (req, res) => {
  try {
    const matches = await Match.find({ donorId: req.params.donorId })
      .populate('requestId')
      .sort({ createdAt: -1 });

    const safeMatches = matches.map(m => {
      const reqData = m.requestId ? m.requestId.toObject() : {};
      
      let reqCity = "Unknown";
      if (reqData.location) {
        if (typeof reqData.location === "object" && reqData.location.city) {
          reqCity = reqData.location.city;
        } else if (typeof reqData.location === "string") {
          reqCity = reqData.location;
        }
      }

      return {
        matchId: m._id,
        status: m.status,
        createdAt: m.createdAt,
        requestDetails: {
          patientName: reqData.patientName || "Unknown Patient",
          patientAge: reqData.patientAge || reqData.age || 'N/A',
          bloodGroup: reqData.bloodGroup || 'N/A',
          patientCondition: reqData.patientCondition || reqData.additionalNotes || 'N/A',
          unitsNeeded: reqData.unitsNeeded || 1,
          city: reqCity,
          urgency: reqData.urgency || "Normal"
        }
      };
    });

    res.json(safeMatches);
  } catch (error) {
    console.error("Error fetching match by donorId:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 5. Fetch all matches (Useful for Global Dashboard Filtering)
// Note: We expect an email parameter to look up the donor's matches since we don't have JWT auth fully baked in the mock
router.get('/matches', async (req, res) => {
  try {
    const { donorEmail, patientEmail } = req.query;
    
    let query = {};
    if (donorEmail) {
      const donor = await Donor.findOne({ email: donorEmail });
      if (!donor) return res.json([]);
      query.donorId = donor._id;
    }
    
    if (patientEmail) {
      const patientRequests = await Request.find({ createdBy: patientEmail }).select('_id');
      const requestIds = patientRequests.map(r => r._id);
      query.requestId = { $in: requestIds };
    }

    const matches = await Match.find(query)
      .populate('requestId')
      .populate('donorId', 'name phone email bloodGroup location')
      .sort({ createdAt: -1 });

    // Filter sensitive fields dynamically if not accepted
    const safeMatches = matches.map(match => {
      let donor = match.donorId ? match.donorId.toObject() : null;
      if (donor && match.status !== 'accepted') {
        delete donor.phone;
        delete donor.email;
      }
      return { ...match.toObject(), donorId: donor };
    });

    res.json(safeMatches);
  } catch (error) {
    console.error("Error fetching matches list:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
