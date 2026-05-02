import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/DashboardUI.css";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

const DonorsPage = ({ donors = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper">
      <motion.div 
        className="dashboard-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: 'transparent', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '20px', fontWeight: '600', padding: 0, fontSize: '14px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <div className="dashboard-header">
          <h1>Donor Directory</h1>
          <p>Complete directory of {donors.length} registered voluntary blood donors.</p>
        </div>

        <div className="panel-card" style={{ marginTop: '24px' }}>
          <div className="panel-header">
            <Users size={18} color="#64748b" />
            <h2>Active Donors</h2>
          </div>
          
          {donors.length === 0 ? (
            <div className="empty-state">
              <Search size={40} color="#e2e8f0" style={{ marginBottom: '16px' }} />
              <div>No donors currently registered in the database.</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Blood Group</th>
                    <th>Location</th>
                    <th>Phone</th>
                    <th>Availability</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map(d => (
                    <tr key={d._id || d.id}>
                      <td><strong>{d.name || "Donor"}</strong></td>
                      <td>
                        <span style={{ color: '#e53935', fontWeight: 'bold' }}>{d.bloodGroup || "N/A"}</span>
                      </td>
                      <td>{d.location?.city || (typeof d.location === 'string' ? d.location : "Unknown")}</td>
                      <td>{d.phone || "N/A"}</td>
                      <td>
                        <span className="badge-urgency medium">Available</span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>{formatDate(d.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DonorsPage;
