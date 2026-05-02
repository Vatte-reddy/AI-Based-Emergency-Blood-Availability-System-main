import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/DashboardUI.css";

const UrgentPage = ({ requests = [] }) => {
  const urgentRequests = useMemo(() => {
    return requests.filter(r => 
      String(r?.predictedPriority || r?.urgency || "").toUpperCase() === "CRITICAL" ||
      String(r?.urgency || "").toUpperCase() === "URGENT" ||
      String(r?.urgency || "").toUpperCase() === "HIGH"
    );
  }, [requests]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <AlertCircle size={28} color="#e53935" />
            <h1 style={{ color: '#e53935', margin: 0 }}>Critical Emergency Queue</h1>
          </div>
          <p>Displaying {urgentRequests.length} high-priority life-saving cases requiring immediate clearance.</p>
        </div>

        <div className="panel-card" style={{ marginTop: '24px', borderTop: '4px solid #e53935' }}>
          <div className="panel-header">
            <AlertCircle size={18} color="#e53935" />
            <h2 style={{ color: '#e53935' }}>Urgent Action Required</h2>
          </div>
          
          {urgentRequests.length === 0 ? (
            <div className="empty-state">
              <Search size={40} color="#e2e8f0" style={{ marginBottom: '16px' }} />
              <div>No urgent requests flagged by the system at this time.</div>
            </div>
          ) : (
             <div className="table-container">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Blood Type</th>
                    <th>Hospital</th>
                    <th>Required Units</th>
                    <th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {urgentRequests.map(r => {
                    const label = r?.predictedPriority || r?.urgency || "URGENT";
                    
                    return (
                      <tr key={r._id || r.id} style={{ backgroundColor: 'rgba(244, 67, 54, 0.02)' }}>
                        <td><strong style={{ color: '#b71c1c' }}>{r.patientName || "Unknown"}</strong></td>
                        <td>
                          <span style={{ fontWeight: 'bold', color: '#e53935' }}>{r.bloodGroup || "N/A"}</span>
                        </td>
                        <td>{r.hospital || (typeof r.location === 'object' && r.location ? r.location.city : r.location) || "N/A"}</td>
                        <td><span style={{ fontWeight: 'bold' }}>{r.unitsNeeded || 1} units</span></td>
                        <td>
                          <span className="badge-urgency critical">
                            {label.toUpperCase()}
                          </span>
                        </td>
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

export default UrgentPage;
