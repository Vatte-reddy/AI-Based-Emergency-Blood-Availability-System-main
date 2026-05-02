import React from "react";
import { useNavigate } from "react-router-dom";
import { Droplets, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/DashboardUI.css";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

const RequestsPage = ({ requests = [] }) => {
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
          <h1>All Active Requests</h1>
          <p>Tracking {requests.length} active blood requirements.</p>
        </div>

        <div className="panel-card" style={{ marginTop: '24px' }}>
          <div className="panel-header">
            <Droplets size={18} color="#64748b" />
            <h2>Requirements Log</h2>
          </div>
          
          {requests.length === 0 ? (
            <div className="empty-state">
              <Search size={40} color="#e2e8f0" style={{ marginBottom: '16px' }} />
              <div>No active requests currently logged.</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Blood Type</th>
                    <th>Hospital / Location</th>
                    <th>Required Units</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Requested On</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => {
                    const urgency = String(r?.predictedPriority || r?.urgency || "Normal").toLowerCase();
                    const label = r?.predictedPriority || r?.urgency || "Normal";
                    
                    return (
                      <tr key={r._id || r.id}>
                        <td><strong>{r.patientName || "Unknown"}</strong></td>
                        <td>
                          <span style={{ fontWeight: 'bold' }}>{r.bloodGroup || "N/A"}</span>
                        </td>
                        <td>{r.hospital}{r.location?.city ? ` (${r.location.city})` : (typeof r.location === 'string' ? ` (${r.location})` : "")}</td>
                        <td>{r.unitsNeeded || 1} units</td>
                        <td>
                          <span style={{ color: '#0f172a', fontWeight: '500' }}>{r.status || 'Pending'}</span>
                        </td>
                        <td>
                          <span className={`badge-urgency ${urgency}`}>
                            {label}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: '#64748b' }}>{formatDate(r.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RequestsPage;
