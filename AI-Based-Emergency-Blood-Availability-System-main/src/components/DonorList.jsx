import React from "react";
import { Trash2, MapPin, Droplet } from "lucide-react";
import "../styles/DonorList.css";

const DonorList = ({ donors, user, onDelete }) => {
  // Filter donors to match current user's profile
  // Because 'donors' backend stores name/phone, we map loosely matching the user's name or display
  // In a robust DB, this matches by `userId` or `email`.
  const userDonors = donors.filter(
    (d) => 
      String(d.email || "").toLowerCase() === String(user?.email || "").toLowerCase() ||
      String(d.name || "").toLowerCase() === String(user?.name || "").toLowerCase()
  );

  if (!user || userDonors.length === 0) {
    return (
      <div className="donor-list-container empty">
        <p>You haven't registered as a donor yet. Submit the form above!</p>
      </div>
    );
  }

  return (
    <div className="donor-list-container">
      <div className="donor-list-header">
        <h3>My Donor Entries</h3>
        <span className="badge">{userDonors.length} active</span>
      </div>

      <div className="donor-entries">
        {userDonors.map((donor) => (
          <div key={donor.id || donor._id} className="donor-entry-card">
            <div className="donor-entry-left">
              <div className="donor-entry-icon">
                <Droplet size={20} />
              </div>
              <div className="donor-entry-details">
                <h4>{donor.name}</h4>
                <div className="donor-entry-meta">
                  <span className="blood-badge">{donor.bloodGroup}</span>
                  <span className="meta-item"><MapPin size={14}/> {donor.location?.city || (typeof donor.location === 'string' ? donor.location : "Unknown")}</span>
                  <span className={`status-badge ${donor.availability ? 'available' : 'unavailable'}`}>
                    {donor.availability ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              className="delete-entry-btn" 
              onClick={() => onDelete(donor.id || donor._id)}
              title="Delete Donor Entry"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorList;
