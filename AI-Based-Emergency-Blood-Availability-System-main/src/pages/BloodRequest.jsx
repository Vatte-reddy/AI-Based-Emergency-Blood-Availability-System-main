import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useGeolocation from "../hooks/useGeolocation";
import {
  Search,
  Heart,
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Droplet,
  Send,
  Plus,
  Zap,
  Activity,
  Trash2,
} from "lucide-react";
import "../styles/BloodRequest.css";
import { apiUrl } from "../config/api";

function BloodRequest({ donors, requests, setRequests, user }) {
  const { location: geoLoc, fetchLocation } = useGeolocation();
  const [activeTab, setActiveTab] = useState('search');
  const [searchData, setSearchData] = useState({ bloodGroup: "", location: "" });
  const [requestData, setRequestData] = useState({
    patientName: "",
    patientAge: "35",
    bloodGroup: "",
    city: "",
    state: "",
    phone: "",
    urgency: "Normal",
    patientCondition: "Normal",
    conditionSeverity: "3",
    timeRequiredHours: "24",
    unitsNeeded: "1",
    hospital: "",
    email: user?.email || "",
    additionalNotes: ""
  });
  const [matched, setMatched] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewPriority, setPreviewPriority] = useState(null);
  const [lastRecommended, setLastRecommended] = useState([]);
  const [criticalAlert, setCriticalAlert] = useState("");
  const [requestedDonors, setRequestedDonors] = useState({});

  const [gpsRequested, setGpsRequested] = useState(false);

  useEffect(() => {
    // Implement robust polling every 3.5 seconds strictly per checklist rules
    const pollMatches = async () => {
      if (requests && requests.length > 0) {
        const activeRequestId = requests[0]._id;
        try {
          const res = await fetch(apiUrl(`/api/match/request/${activeRequestId}`));
          if (!res.ok) return;
          const data = await res.json();
          if (Array.isArray(data)) {
            const syncState = {};
            data.forEach(matchInfo => {
              if (matchInfo.donor) {
                // strict mapping: matchId, status, donor._id
                syncState[matchInfo.donor._id] = matchInfo.status;
              }
            });
            setRequestedDonors(syncState);
          }
        } catch (err) {
          // silent fallback for polling
        }
      }
    };

    pollMatches(); // initial sync
    const intervalId = setInterval(pollMatches, 3500); // Poll every 3.5s
    return () => clearInterval(intervalId);
  }, [requests]);

  const handleRequestConnection = async (donorId) => {
    if (requests.length === 0) {
      setMessage("Please submit a New Request first to get a tracking ID.");
      return;
    }
    const requestId = requests[0]._id;
    try {
      const res = await fetch(apiUrl("/api/match-request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorId, requestId })
      });
      if (!res.ok) {
        const txt = await res.json();
        throw new Error(txt.message || "Failed to create match");
      }
      setRequestedDonors(prev => ({ ...prev, [donorId]: "pending" }));
      setMessage("Request sent successfully");
    } catch(e) {
      setMessage(e.message || "Something went wrong");
    }
  };

  const handleSearchChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestData({ ...requestData, [name]: value });
    setMessage("");
  };

  // Helper dedicated effect for one-time GPS snap in BloodRequest
  useEffect(() => {
    if (gpsRequested && geoLoc && loading === false) {
      if (activeTab === 'search') {
        setSearchData(prev => ({
          ...prev,
          location: geoLoc.city || prev.location
        }));
      } else if (activeTab === 'request') {
        setRequestData(prev => ({
          ...prev,
          city: geoLoc.city || prev.city,
          state: geoLoc.state || prev.state
        }));
      }
      setGpsRequested(false);
    }
  }, [geoLoc, gpsRequested, activeTab, loading]);

  const handlePreviewPriority = async () => {
    setLoading(true);
    setPreviewPriority(null);
    setMessage("");
    try {
      const res = await fetch(apiUrl("/api/predict-priority"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseInt(requestData.patientAge, 10) || 35,
          condition_severity: parseInt(requestData.conditionSeverity, 10) || 3,
          time_required_hours: parseFloat(requestData.timeRequiredHours) || 24,
          units_needed: parseInt(requestData.unitsNeeded, 10) || 1,
        }),
      });
      if (!res.ok) {
        let previewMessage = "Preview failed";
        try {
          const txt = await res.text();
          console.error("[DEBUG] AI Preview response status:", res.status, "Raw text:", txt);
          try {
            const body = JSON.parse(txt);
            previewMessage = body.message || body.error || previewMessage;
          } catch (_) {
            if (txt) previewMessage = txt;
          }
        } catch (e) {
          console.error("Could not read response body", e);
        }
        throw new Error(previewMessage);
      }
      const data = await res.json();
      setPreviewPriority(data);
    } catch (err) {
      setMessage(err.message || "Could not preview priority.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!searchData.bloodGroup) {
      setMessage("Please select a blood group before searching.");
      setMatched([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/donors?bloodGroup=${encodeURIComponent(searchData.bloodGroup)}&location=${encodeURIComponent(searchData.location || "")}`)
      );
      
      if (!response.ok) throw new Error("Search failed.");

      const result = await response.json();
      let donors = result.donors || [];

      // Simple City Filtering
      if (searchData.location && donors.length > 0) {
        const searchCity = searchData.location.toLowerCase().trim();
        donors = donors.filter(d => {
          const donorCity = (typeof d.location === 'string' ? d.location : d.location?.city || "").toLowerCase();
          return donorCity.includes(searchCity);
        });
      }

      setMatched(donors);
      setMessage(donors.length > 0 ? `Found ${donors.length} compatible donors.` : "No donors found in this area.");
    } catch (error) {
      console.error("Search error:", error);
      setMessage("Unable to complete search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!requestData.patientName || !requestData.bloodGroup || !requestData.phone || !requestData.city || !requestData.state) {
      setMessage("Please fill all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        patientName: requestData.patientName.trim(),
        bloodGroup: requestData.bloodGroup,
        phone: requestData.phone,
        city: requestData.city.trim(),
        state: requestData.state.trim(),
        urgency: requestData.urgency,
        hospital: requestData.hospital,
        additionalNotes: requestData.additionalNotes,
        patientCondition: requestData.patientCondition,
        patientAge: parseInt(requestData.patientAge, 10) || 35,
        conditionSeverity: parseInt(requestData.conditionSeverity, 10) || 3,
        timeRequiredHours: parseFloat(requestData.timeRequiredHours) || 24,
        unitsNeeded: parseInt(requestData.unitsNeeded, 10) || 1,
        email: requestData.email || user?.email || "anonymous",
        createdBy: user?.email || "anonymous",
      };

      const response = await fetch(apiUrl("/api/requests/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Request failed.");

      const data = await response.json();
      setRequests((prev) => [data.request, ...prev]);
      
      setMessage("Blood request submitted successfully!");
      setActiveTab('history'); // Move to history to show success
      
      // Reset form
      setRequestData({
        patientName: "", patientAge: "35", bloodGroup: "", phone: "",
        city: "", state: "", urgency: "Normal", patientCondition: "Normal",
        conditionSeverity: "3", timeRequiredHours: "24", unitsNeeded: "1",
        hospital: "", email: user?.email || "", additionalNotes: ""
      });
    } catch (error) {
      console.error("Submission error:", error);
      addToast("Failed to submit request.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!id) {
      addToast("Error: Missing request ID", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this blood request?")) return;

    try {
      const response = await fetch(apiUrl(`/api/requests/${id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Delete failed");
      }

      setHistory((prev) => prev.filter((r) => String(r._id || r.id) !== String(id)));
      addToast("Request deleted successfully", "success");
    } catch (err) {
      console.error("Deletion error:", err);
      addToast(`Failed to delete request: ${err.message}`, "error");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const urgencyColors = {
    Normal: { bg: "rgba(76, 175, 80, 0.1)", color: "#4caf50", icon: Clock },
    Urgent: { bg: "rgba(255, 152, 0, 0.1)", color: "#ff9800", icon: AlertTriangle },
    Critical: { bg: "rgba(244, 67, 54, 0.1)", color: "#f44336", icon: AlertTriangle },
    LOW: { bg: "rgba(76, 175, 80, 0.15)", color: "#2e7d32", icon: CheckCircle },
    MEDIUM: { bg: "rgba(255, 152, 0, 0.15)", color: "#ef6c00", icon: Clock },
    CRITICAL: { bg: "rgba(244, 67, 54, 0.2)", color: "#c62828", icon: AlertTriangle },
  };

  return (
    <motion.div
      className="blood-request-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="request-header"
        variants={itemVariants}
      >
        <div className="header-banner">
          <div className="header-content">
            <Heart size={40} className="header-icon" />
            <div className="header-text-block">
              <h1>Emergency Blood Allocation</h1>
              <p>AI priority prediction, compatible matching, and smart donor ranking</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        className="request-tabs"
        variants={itemVariants}
      >
        <button
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Search size={18} />
          Find Donors
        </button>
        <button
          className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          <Plus size={18} />
          New Request
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={18} />
          Recent Requests
        </button>
      </motion.div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          <div className="search-section">
            <h2>Find Available Donors</h2>
            <p>Search for blood donors in your area</p>

            <form onSubmit={handleSearch} className="search-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Blood Group</label>
                  <div className="input-wrapper">
                    <Droplet size={20} className="input-icon" />
                    <select
                      name="bloodGroup"
                      value={searchData.bloodGroup}
                      onChange={handleSearchChange}
                      required
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Location (City/Region)</label>
                  <div className="input-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="modern-input-row" style={{ position: 'relative', width: '100%' }}>
                      <MapPin size={20} className="input-icon" />
                      <input
                        type="text"
                        name="location"
                        style={{ paddingLeft: '40px', width: '100%' }}
                        placeholder="Enter City (e.g. Karimnagar)"
                        value={searchData.location}
                        onChange={handleSearchChange}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGpsRequested(true);
                        fetchLocation();
                      }}
                      className={`gps-btn ${loading ? 'loading' : ''}`}
                      style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: (searchData.lat) ? '#ecfdf5' : '#f8fafc', color: (searchData.lat) ? '#10b981' : '#64748b', border: `1px solid ${(searchData.lat) ? '#6ee7b7' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Zap size={18} />
                      {loading ? "Detecting..." : (searchData.lat ? "Exact Location Snapped ✓" : "Detect My Position")}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                className="search-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <Search size={18} />
                    Search Donors
                  </>
                )}
              </motion.button>
            </form>

            {message && (
              <motion.div
                className={`message ${matched.length > 0 ? 'success' : 'info'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {matched.length > 0 ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                {message}
              </motion.div>
            )}

            {matched.length > 0 && (
              <div className="matched-donors">
                <h3>Available Donors ({matched.length})</h3>
                <div className="donors-grid">
                  {matched.map((donor) => (
                    <motion.div
                      key={donor._id || donor.id}
                      className="donor-card"
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="donor-header">
                        <div className="donor-avatar">
                          <Users size={24} />
                        </div>
                        <div className="donor-info">
                          <h4>{donor.name}</h4>
                          <span className="blood-type">{donor.bloodGroup}</span>
                        </div>
                      </div>
                      <div className="donor-details">
                        <div className="detail-item">
                          <MapPin size={16} />
                          <span>{typeof donor.location === 'object' && donor.location ? `${donor.location.city}, ${donor.location.state}` : donor.location || "Unknown"}</span>
                        </div>
                        {donor.distanceKm != null && (
                          <div className="detail-item ai-distance">
                            <Activity size={16} />
                            <span>~{donor.distanceKm} km (estimated)</span>
                          </div>
                        )}
                        {donor.responseProbability != null && (
                          <div className="detail-item ai-distance">
                            <Zap size={16} />
                            <span>Likely to respond: {Number(donor.responseProbability).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="detail-item" style={{alignItems: 'flex-start'}}>
                          <Phone size={16} style={{marginTop: '4px'}} />
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                            {requestedDonors[donor._id || donor.id] === 'accepted' ? (
                              <div style={{display: 'flex', gap: '8px', marginTop: '2px'}}>
                                {donor.phone && <a href={`tel:${donor.phone}`} style={{background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', fontWeight: '500'}}>Call {donor.phone}</a>}
                                {donor.email && <a href={`mailto:${donor.email}`} style={{background: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', fontWeight: '500'}}>Email Donor</a>}
                              </div>
                            ) : (
                              <span style={{color: '#9ca3af', fontStyle: 'italic', paddingTop: '2px'}}>Contact hidden until accepted</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        className={`contact-btn`}
                        onClick={() => handleRequestConnection(donor._id || donor.id)}
                        disabled={!!requestedDonors[donor._id || donor.id]}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={requestedDonors[donor._id || donor.id] ? { opacity: 1, cursor: "not-allowed", backgroundColor: requestedDonors[donor._id || donor.id] === 'rejected' ? '#fef2f2' : requestedDonors[donor._id || donor.id] === 'accepted' ? '#ecfdf5' : '#fffbeb', color: requestedDonors[donor._id || donor.id] === 'rejected' ? '#ef4444' : requestedDonors[donor._id || donor.id] === 'accepted' ? '#10b981' : '#d97706', border: `1px solid ${requestedDonors[donor._id || donor.id] === 'rejected' ? '#fca5a5' : requestedDonors[donor._id || donor.id] === 'accepted' ? '#6ee7b7' : '#fcd34d'}` } : {}}
                      >
                        {!requestedDonors[donor._id || donor.id] && <Send size={16} />}
                        {requestedDonors[donor._id || donor.id] === 'pending' ? '⏳ Request Pending' :
                         requestedDonors[donor._id || donor.id] === 'accepted' ? '✅ Request Accepted' :
                         requestedDonors[donor._id || donor.id] === 'rejected' ? '❌ Request Rejected' :
                         "Request Connection"}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Request Tab */}
      {activeTab === 'request' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          <div className="request-section">
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Emergency Blood Allocation</h2>
            <p style={{ textAlign: 'center' }}>AI-driven priority prediction and smart compatible donor matching.</p>

            {criticalAlert ? (
              <motion.div
                className="critical-alert-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertTriangle size={22} />
                <div>
                  <strong>CRITICAL alert (simulated)</strong>
                  <p>{criticalAlert}</p>
                </div>
              </motion.div>
            ) : null}

            <form onSubmit={handleRequestSubmit} className="request-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Patient Name *</label>
                  <div className="input-wrapper">
                    <Users size={20} className="input-icon" />
                    <input
                      type="text"
                      name="patientName"
                      placeholder="Enter patient name"
                      value={requestData.patientName}
                      onChange={handleRequestChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Required Blood Group *</label>
                  <div className="input-wrapper">
                    <Droplet size={20} className="input-icon" />
                    <select
                      name="bloodGroup"
                      value={requestData.bloodGroup}
                      onChange={handleRequestChange}
                      required
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Requester Email *</label>
                  <div className="input-wrapper">
                    <Send size={20} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={requestData.email}
                      onChange={handleRequestChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Phone *</label>
                  <div className="input-wrapper">
                    <Phone size={20} className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter 10-digit phone number"
                      value={requestData.phone}
                      onChange={(e) => setRequestData({
                        ...requestData,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10)
                      })}
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Staff-reported urgency</label>
                  <div className="input-wrapper">
                    <select
                      name="urgency"
                      value={requestData.urgency}
                      onChange={handleRequestChange}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <p className="ai-section-label">
                <Zap size={18} aria-hidden />
                Inputs for ML priority (match your Colab feature order)
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient age</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="patientAge"
                      min={1}
                      max={120}
                      value={requestData.patientAge}
                      onChange={handleRequestChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Condition severity (1–5)</label>
                  <div className="input-wrapper">
                    <select
                      name="conditionSeverity"
                      value={requestData.conditionSeverity}
                      onChange={handleRequestChange}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={String(n)}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Time blood needed within (hours)</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="timeRequiredHours"
                      min={1}
                      max={168}
                      step={1}
                      value={requestData.timeRequiredHours}
                      onChange={handleRequestChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Units needed</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="unitsNeeded"
                      min={1}
                      max={10}
                      value={requestData.unitsNeeded}
                      onChange={handleRequestChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Patient condition (short)</label>
                <div className="input-wrapper">
                  <select
                    name="patientCondition"
                    value={requestData.patientCondition}
                    onChange={handleRequestChange}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="ai-preview-row">
                <motion.button
                  type="button"
                  className="preview-ai-btn"
                  onClick={handlePreviewPriority}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap size={18} />
                  Preview AI priority
                </motion.button>
                {previewPriority?.priority ? (
                  <span
                    className={`priority-chip priority-${String(previewPriority.priority).toLowerCase()}`}
                  >
                    <Activity size={16} />
                    {previewPriority.priority}
                  </span>
                ) : null}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Town / City *</label>
                  <div className="input-wrapper">
                    <MapPin size={20} className="input-icon" />
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Hyderabad"
                      value={requestData.city}
                      onChange={handleRequestChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="state"
                      placeholder="e.g. Telangana"
                      value={requestData.state}
                      onChange={handleRequestChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Hospital Name (Optional)</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="hospital"
                    placeholder="Enter hospital name"
                    value={requestData.hospital}
                    onChange={handleRequestChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <div className="input-wrapper">
                  <textarea
                    name="additionalNotes"
                    placeholder="Any additional information about the patient or request..."
                    value={requestData.additionalNotes}
                    onChange={handleRequestChange}
                    rows={3}
                  />
                </div>
              </div>

              {message && (
                <motion.div
                  className={`message ${
                    message.includes("Request logged") || message.includes("successfully")
                      ? "success"
                      : "error"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.includes("Request logged") || message.includes("successfully") ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertTriangle size={20} />
                  )}
                  {message}
                </motion.div>
              )}

              <motion.button
                type="submit"
                className="submit-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Blood Request
                  </>
                )}
              </motion.button>
            </form>

            {lastRecommended.length > 0 && (
              <div className="matched-donors ai-recommended-block">
                <h3>Top AI-matched donors (last submission)</h3>
                <div className="donors-grid">
                  {lastRecommended.map((donor) => (
                    <motion.div
                      key={donor.id || donor._id}
                      className="donor-card"
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="donor-header">
                        <div className="donor-avatar">
                          <Users size={24} />
                        </div>
                        <div className="donor-info">
                          <h4>{donor.name}</h4>
                          <span className="blood-type">{donor.bloodGroup}</span>
                        </div>
                      </div>
                      <div className="donor-details">
                        <div className="detail-item">
                          <MapPin size={16} />
                          <span>{typeof donor.location === 'object' && donor.location ? `${donor.location.city}, ${donor.location.state}` : donor.location || "Unknown"}</span>
                        </div>
                        {donor.distanceKm != null && (
                          <div className="detail-item ai-distance">
                            <Activity size={16} />
                            <span>~{donor.distanceKm} km</span>
                          </div>
                        )}
                        {donor.responseProbability != null && (
                          <div className="detail-item ai-distance">
                            <Zap size={16} />
                            <span>Likely to respond: {Number(donor.responseProbability).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="detail-item">
                          <Phone size={16} />
                          <span>{requestedDonors[donor._id || donor.id] === 'accepted' ? donor.phone : 'Hidden until accepted'}</span>
                        </div>
                      </div>
                      <motion.button
                        className={`contact-btn ${requestedDonors[donor._id || donor.id]}`}
                        style={{ marginTop: '15px', ...(requestedDonors[donor._id || donor.id] ? { opacity: 0.8, cursor: "not-allowed", backgroundColor: requestedDonors[donor._id || donor.id] === 'rejected' ? '#f43f5e' : requestedDonors[donor._id || donor.id] === 'accepted' ? '#10b981' : '#94a3b8' } : {}) }}
                        onClick={() => handleRequestConnection(donor._id || donor.id)}
                        disabled={!!requestedDonors[donor._id || donor.id]}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Send size={16} />
                        {requestedDonors[donor._id || donor.id] ? requestedDonors[donor._id || donor.id].toUpperCase() : "Request Connection"}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          <div className="history-section">
            <h2>Recent Blood Requests</h2>
            <p>Track the status of recent blood requests</p>

            {requests.length === 0 ? (
              <div className="empty-state">
                <Heart size={48} className="empty-icon" />
                <h3>No requests yet</h3>
                <p>Submit your first blood request to get started</p>
              </div>
            ) : (
              <div className="requests-list">
                {requests.slice(0, 10).map((request) => {
                  const UrgencyIcon = urgencyColors[request.urgency]?.icon || Clock;
                  const urgencyStyle = urgencyColors[request.urgency] || urgencyColors.Normal;
                  const aiP = request.predictedPriority;
                  const aiStyle = aiP ? urgencyColors[aiP] : null;

                  return (
                    <motion.div
                      key={request._id || request.id}
                      className="request-card"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="request-header">
                        <div className="request-info">
                          <h4>{request.patientName}</h4>
                          <span className="blood-type">{request.bloodGroup}</span>
                          <span
                            className="urgency-badge"
                            style={{
                              backgroundColor: urgencyStyle.bg,
                              color: urgencyStyle.color
                            }}
                          >
                            <UrgencyIcon size={14} />
                            {request.urgency}
                          </span>
                          {aiP && aiStyle ? (
                            <span
                              className="urgency-badge ai-priority-badge"
                              style={{
                                backgroundColor: aiStyle.bg,
                                color: aiStyle.color
                              }}
                            >
                              <Zap size={14} />
                              AI: {aiP}
                            </span>
                          ) : null}
                        </div>
                        <div className="request-time">
                          <Clock size={16} />
                          <span>{new Date(request.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="request-details">
                        <div className="detail-item">
                          <MapPin size={16} />
                          <span>{request.location?.city || "Unknown"}, {request.location?.state || ""}</span>
                        </div>
                        <div className="detail-item">
                          <Phone size={16} />
                          <span style={{ color: request.phone ? 'inherit' : '#94a3b8', fontStyle: request.phone ? 'normal' : 'italic' }}>
                            {request.phone || "No phone listed"}
                          </span>
                        </div>
                        {request.hospital && (
                          <div className="detail-item">
                            <span>🏥 {request.hospital}</span>
                          </div>
                        )}
                      </div>

                      <div className="request-status-row">
                        <div className="request-status">
                          <span className={`status-badge ${request.status?.toLowerCase() || 'pending'}`}>
                            {request.status || 'Pending'}
                          </span>
                        </div>
                        
                        {(request.createdBy === user?.email || !request.createdBy) && (
                          <button 
                            className="delete-request-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(request._id || request.id);
                            }}
                            title="Delete Request"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default BloodRequest;
