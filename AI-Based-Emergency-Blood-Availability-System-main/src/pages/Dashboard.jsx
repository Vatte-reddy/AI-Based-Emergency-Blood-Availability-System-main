import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Droplets, Activity, History } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/DashboardUI.css";

const DashboardHeader = ({ user }) => (
  <div className="dashboard-header-container">
    <h1>Welcome back, {user?.name || "Admin"}</h1>
    <p>Here’s what’s happening with your BloodHub today.</p>
  </div>
);

const StatsCards = ({ counts, navigate }) => (
  <div className="stats-grid">
    <div className="stat-card clickable" onClick={() => navigate('/donors')} style={{ cursor: 'pointer' }}>
      <div className="stat-icon-wrapper blue">
        <Users size={24} />
      </div>
      <div className="stat-info">
        <span className="stat-label">Total Donors</span>
        <span className="stat-value">{counts.donors || 0}</span>
      </div>
    </div>

    <div className="stat-card clickable" onClick={() => navigate('/requests')} style={{ cursor: 'pointer' }}>
      <div className="stat-icon-wrapper green">
        <Droplets size={24} />
      </div>
      <div className="stat-info">
        <span className="stat-label">Active Requests</span>
        <span className="stat-value">{counts.requests || 0}</span>
      </div>
    </div>

    <div className="stat-card clickable" onClick={() => navigate('/urgent')} style={{ cursor: 'pointer' }}>
      <div className="stat-icon-wrapper red">
        <Activity size={24} />
      </div>
      <div className="stat-info">
        <span className="stat-label">Critical Cases</span>
        <span className="stat-value">{counts.critical || 0}</span>
      </div>
    </div>
  </div>
);

const RecentRequests = ({ requests }) => (
  <div className="panel-card">
    <div className="panel-header">
      <History size={18} color="#6B7280" />
      <h2>Recent Requests</h2>
    </div>
    
    {requests.length === 0 ? (
      <div className="empty-state-modern">
        <Droplets size={48} color="#9CA3AF" style={{ marginBottom: "16px", opacity: 0.5 }} />
        <p>No active requests right now.</p>
        <span className="empty-state-sub">New requests will automatically appear here.</span>
      </div>
    ) : (
      <div className="table-container">
        <table className="clean-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Blood Group</th>
              <th>Hospital</th>
              <th>Urgency</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r._id || r.id}>
                <td><strong>{r.patientName || "Unknown"}</strong></td>
                <td>{r.bloodGroup || "N/A"}</td>
                <td>{r.hospital}{r.location?.city ? ` (${r.location.city})` : (r.location || "")}</td>
                <td>
                  <span className={`badge-urgency ${(r.priorityLabel || r.urgency || "low").toLowerCase()}`}>
                    {r.priorityLabel || r.urgency || "Normal"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

function Dashboard({ donors = [], requests = [], user }) {
  const navigate = useNavigate();

  // Memoized data counting to preserve existing logic hooks
  const counts = useMemo(() => {
    const critical = requests.filter(
      (r) =>
        String(r?.predictedPriority || r?.urgency || "").toUpperCase() === "CRITICAL" ||
        String(r?.urgency || "").toLowerCase() === "critical"
    ).length;
    return {
      donors: donors.length,
      requests: requests.length,
      critical,
    };
  }, [donors, requests]);

  // Derived sorted requests
  const recentRequestsList = useMemo(() => {
    const rank = { CRITICAL: 0, HIGH: 1, URGENT: 1, MEDIUM: 2, NORMAL: 2, LOW: 3 };
    const toPriority = (r) => {
      if (r?.predictedPriority) return String(r.predictedPriority).toUpperCase();
      const u = String(r?.urgency || "").toUpperCase();
      return u;
    };
    return [...requests]
      .map((r) => ({ ...r, priorityLabel: toPriority(r) }))
      .sort((a, b) => {
        const ra = rank[a.priorityLabel] ?? 9;
        const rb = rank[b.priorityLabel] ?? 9;
        if (ra !== rb) return ra - rb;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })
      .slice(0, 5); // display only top 5 recent for clean table fitting
  }, [requests]);

  return (
    <div className="dashboard-wrapper">
      <motion.div 
        className="dashboard-container"
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
      >
        <DashboardHeader user={user} />
        
        <StatsCards counts={counts} navigate={navigate} />
        
        <div className="main-content-grid">
          <RecentRequests requests={recentRequestsList} />
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
